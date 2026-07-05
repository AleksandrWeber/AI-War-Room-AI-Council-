import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getAllegorizabilityRolloutGuidance,
  allegorizabilityAdminActionRequestSchema,
  allegorizabilityAdminActionResponseSchema,
  allegorizabilityAdminSummaryResponseSchema,
  allegorizabilityCapabilitiesResponseSchema,
  allegorizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildAllegorizabilityAdminRecords,
  buildAllegorizabilityAdminStats,
  getAllegorizabilityAdminGuidance,
  resolveAllegorizabilityAdminActions,
} from './allegorizability-admin.helpers.js'
import { evaluateAllegorizabilityRollout } from './allegorizability-rollout.helpers.js'
import { AllegorizabilityStatusService } from './allegorizability-status.service.js'

@Injectable()
export class AllegorizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly allegorizabilityStatusService: AllegorizabilityStatusService,
  ) {}

  getCapabilities() {
    return allegorizabilityCapabilitiesResponseSchema.parse({
      supportsAllegorizabilityRollout: true,
      supportsAllegorizabilityAdminTools: true,
      supportsIdempotencyKeyAllegorizabilitySignals: true,
      supportsUsageEventAllegorizabilitySignals: true,
      guidance: getAllegorizabilityRolloutGuidance(),
    })
  }

  async getAllegorizabilityRollout() {
    const allegorizabilityTableCoverage =
      await this.allegorizabilityStatusService.getAllegorizabilityTableCoverage()

    const rollout = evaluateAllegorizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.allegorizabilityStatusService.pingPostgres(),
      existingAllegorizabilityTableCount: allegorizabilityTableCoverage.existingAllegorizabilityTableCount,
      idempotencyKeysTableExists: allegorizabilityTableCoverage.idempotencyKeysTableExists,
      usageEventsTableExists: allegorizabilityTableCoverage.usageEventsTableExists,
      billingWebhookEventsTableExists: allegorizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return allegorizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceAllegorizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageAllegorizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.allegorizabilityStatusService.getWorkspaceAllegorizabilityInventory(
        workspaceId,
      )
    const records = buildAllegorizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.allegorizabilityStatusService.pingPostgres()
    const stats = buildAllegorizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return allegorizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveAllegorizabilityAdminActions(),
      guidance: getAllegorizabilityAdminGuidance({ stats }),
    })
  }

  async executeAllegorizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_allegorizability_summary'
    },
  ) {
    this.assertCanManageAllegorizability(authContext)

    const payload = allegorizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_allegorizability_summary': {
        const summary = await this.getWorkspaceAllegorizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return allegorizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed allegorizability summary with ${summary.stats.allegorizabilityPercent}% idempotency key allegorizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageAllegorizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production allegorizability tools.',
    })
  }
}
