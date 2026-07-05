import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getTriggeringizabilityRolloutGuidance,
  triggeringizabilityAdminActionRequestSchema,
  triggeringizabilityAdminActionResponseSchema,
  triggeringizabilityAdminSummaryResponseSchema,
  triggeringizabilityCapabilitiesResponseSchema,
  triggeringizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildTriggeringizabilityAdminRecords,
  buildTriggeringizabilityAdminStats,
  getTriggeringizabilityAdminGuidance,
  resolveTriggeringizabilityAdminActions,
} from './triggeringizability-admin.helpers.js'
import { evaluateTriggeringizabilityRollout } from './triggeringizability-rollout.helpers.js'
import { TriggeringizabilityStatusService } from './triggeringizability-status.service.js'

@Injectable()
export class TriggeringizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly triggeringizabilityStatusService: TriggeringizabilityStatusService,
  ) {}

  getCapabilities() {
    return triggeringizabilityCapabilitiesResponseSchema.parse({
      supportsTriggeringizabilityRollout: true,
      supportsTriggeringizabilityAdminTools: true,
      supportsWorkspaceLimitTriggeringizabilitySignals: true,
      supportsUsageEventTriggeringizabilitySignals: true,
      guidance: getTriggeringizabilityRolloutGuidance(),
    })
  }

  async getTriggeringizabilityRollout() {
    const triggeringizabilityTableCoverage =
      await this.triggeringizabilityStatusService.getTriggeringizabilityTableCoverage()

    const rollout = evaluateTriggeringizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.triggeringizabilityStatusService.pingPostgres(),
      existingTriggeringizabilityTableCount: triggeringizabilityTableCoverage.existingTriggeringizabilityTableCount,
      workspaceUsageLimitsTableExists: triggeringizabilityTableCoverage.workspaceUsageLimitsTableExists,
      usageEventsTableExists: triggeringizabilityTableCoverage.usageEventsTableExists,
      billingRecordsTableExists: triggeringizabilityTableCoverage.billingRecordsTableExists,
    })

    return triggeringizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceTriggeringizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageTriggeringizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.triggeringizabilityStatusService.getWorkspaceTriggeringizabilityInventory(
        workspaceId,
      )
    const records = buildTriggeringizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.triggeringizabilityStatusService.pingPostgres()
    const stats = buildTriggeringizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return triggeringizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveTriggeringizabilityAdminActions(),
      guidance: getTriggeringizabilityAdminGuidance({ stats }),
    })
  }

  async executeTriggeringizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_triggeringizability_summary'
    },
  ) {
    this.assertCanManageTriggeringizability(authContext)

    const payload = triggeringizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_triggeringizability_summary': {
        const summary = await this.getWorkspaceTriggeringizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return triggeringizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed triggeringizability summary with ${summary.stats.triggeringizabilityPercent}% workspace limit triggeringizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageTriggeringizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production triggeringizability tools.',
    })
  }
}
