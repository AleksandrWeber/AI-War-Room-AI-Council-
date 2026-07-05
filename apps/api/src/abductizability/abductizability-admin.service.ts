import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getAbductizabilityRolloutGuidance,
  abductizabilityAdminActionRequestSchema,
  abductizabilityAdminActionResponseSchema,
  abductizabilityAdminSummaryResponseSchema,
  abductizabilityCapabilitiesResponseSchema,
  abductizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildAbductizabilityAdminRecords,
  buildAbductizabilityAdminStats,
  getAbductizabilityAdminGuidance,
  resolveAbductizabilityAdminActions,
} from './abductizability-admin.helpers.js'
import { evaluateAbductizabilityRollout } from './abductizability-rollout.helpers.js'
import { AbductizabilityStatusService } from './abductizability-status.service.js'

@Injectable()
export class AbductizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly abductizabilityStatusService: AbductizabilityStatusService,
  ) {}

  getCapabilities() {
    return abductizabilityCapabilitiesResponseSchema.parse({
      supportsAbductizabilityRollout: true,
      supportsAbductizabilityAdminTools: true,
      supportsIdempotencyKeyAbductizabilitySignals: true,
      supportsUsageEventAbductizabilitySignals: true,
      guidance: getAbductizabilityRolloutGuidance(),
    })
  }

  async getAbductizabilityRollout() {
    const abductizabilityTableCoverage =
      await this.abductizabilityStatusService.getAbductizabilityTableCoverage()

    const rollout = evaluateAbductizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.abductizabilityStatusService.pingPostgres(),
      existingAbductizabilityTableCount: abductizabilityTableCoverage.existingAbductizabilityTableCount,
      idempotencyKeysTableExists: abductizabilityTableCoverage.idempotencyKeysTableExists,
      usageEventsTableExists: abductizabilityTableCoverage.usageEventsTableExists,
      billingWebhookEventsTableExists: abductizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return abductizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceAbductizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageAbductizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.abductizabilityStatusService.getWorkspaceAbductizabilityInventory(
        workspaceId,
      )
    const records = buildAbductizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.abductizabilityStatusService.pingPostgres()
    const stats = buildAbductizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return abductizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveAbductizabilityAdminActions(),
      guidance: getAbductizabilityAdminGuidance({ stats }),
    })
  }

  async executeAbductizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_abductizability_summary'
    },
  ) {
    this.assertCanManageAbductizability(authContext)

    const payload = abductizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_abductizability_summary': {
        const summary = await this.getWorkspaceAbductizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return abductizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed abductizability summary with ${summary.stats.abductizabilityPercent}% idempotency key abductizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageAbductizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production abductizability tools.',
    })
  }
}
