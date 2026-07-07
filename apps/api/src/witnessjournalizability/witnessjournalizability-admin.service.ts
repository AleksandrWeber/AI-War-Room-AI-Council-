import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getWitnessjournalizabilityRolloutGuidance,
  witnessjournalizabilityAdminActionRequestSchema,
  witnessjournalizabilityAdminActionResponseSchema,
  witnessjournalizabilityAdminSummaryResponseSchema,
  witnessjournalizabilityCapabilitiesResponseSchema,
  witnessjournalizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildWitnessjournalizabilityAdminRecords,
  buildWitnessjournalizabilityAdminStats,
  getWitnessjournalizabilityAdminGuidance,
  resolveWitnessjournalizabilityAdminActions,
} from './witnessjournalizability-admin.helpers.js'
import { evaluateWitnessjournalizabilityRollout } from './witnessjournalizability-rollout.helpers.js'
import { WitnessjournalizabilityStatusService } from './witnessjournalizability-status.service.js'

@Injectable()
export class WitnessjournalizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly witnessjournalizabilityStatusService: WitnessjournalizabilityStatusService,
  ) {}

  getCapabilities() {
    return witnessjournalizabilityCapabilitiesResponseSchema.parse({
      supportsWitnessjournalizabilityRollout: true,
      supportsWitnessjournalizabilityAdminTools: true,
      supportsIdempotencyKeyWitnessjournalizabilitySignals: true,
      supportsUsageEventWitnessjournalizabilitySignals: true,
      guidance: getWitnessjournalizabilityRolloutGuidance(),
    })
  }

  async getWitnessjournalizabilityRollout() {
    const witnessjournalizabilityTableCoverage =
      await this.witnessjournalizabilityStatusService.getWitnessjournalizabilityTableCoverage()

    const rollout = evaluateWitnessjournalizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.witnessjournalizabilityStatusService.pingPostgres(),
      existingWitnessjournalizabilityTableCount: witnessjournalizabilityTableCoverage.existingWitnessjournalizabilityTableCount,
      idempotencyKeysTableExists: witnessjournalizabilityTableCoverage.idempotencyKeysTableExists,
      usageEventsTableExists: witnessjournalizabilityTableCoverage.usageEventsTableExists,
      billingWebhookEventsTableExists: witnessjournalizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return witnessjournalizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceWitnessjournalizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageWitnessjournalizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.witnessjournalizabilityStatusService.getWorkspaceWitnessjournalizabilityInventory(
        workspaceId,
      )
    const records = buildWitnessjournalizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.witnessjournalizabilityStatusService.pingPostgres()
    const stats = buildWitnessjournalizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return witnessjournalizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveWitnessjournalizabilityAdminActions(),
      guidance: getWitnessjournalizabilityAdminGuidance({ stats }),
    })
  }

  async executeWitnessjournalizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_witnessjournalizability_summary'
    },
  ) {
    this.assertCanManageWitnessjournalizability(authContext)

    const payload = witnessjournalizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_witnessjournalizability_summary': {
        const summary = await this.getWorkspaceWitnessjournalizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return witnessjournalizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed witnessjournalizability summary with ${summary.stats.witnessjournalizabilityPercent}% idempotency key witnessjournalizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageWitnessjournalizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production witnessjournalizability tools.',
    })
  }
}
