import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getTriggerizabilityRolloutGuidance,
  triggerizabilityAdminActionRequestSchema,
  triggerizabilityAdminActionResponseSchema,
  triggerizabilityAdminSummaryResponseSchema,
  triggerizabilityCapabilitiesResponseSchema,
  triggerizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildTriggerizabilityAdminRecords,
  buildTriggerizabilityAdminStats,
  getTriggerizabilityAdminGuidance,
  resolveTriggerizabilityAdminActions,
} from './triggerizability-admin.helpers.js'
import { evaluateTriggerizabilityRollout } from './triggerizability-rollout.helpers.js'
import { TriggerizabilityStatusService } from './triggerizability-status.service.js'

@Injectable()
export class TriggerizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly triggerizabilityStatusService: TriggerizabilityStatusService,
  ) {}

  getCapabilities() {
    return triggerizabilityCapabilitiesResponseSchema.parse({
      supportsTriggerizabilityRollout: true,
      supportsTriggerizabilityAdminTools: true,
      supportsBillingNotificationTriggerizabilitySignals: true,
      supportsBillingWebhookTriggerizabilitySignals: true,
      guidance: getTriggerizabilityRolloutGuidance(),
    })
  }

  async getTriggerizabilityRollout() {
    const triggerizabilityTableCoverage =
      await this.triggerizabilityStatusService.getTriggerizabilityTableCoverage()

    const rollout = evaluateTriggerizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.triggerizabilityStatusService.pingPostgres(),
      existingTriggerizabilityTableCount: triggerizabilityTableCoverage.existingTriggerizabilityTableCount,
      billingNotificationsTableExists: triggerizabilityTableCoverage.billingNotificationsTableExists,
      billingWebhookEventsTableExists: triggerizabilityTableCoverage.billingWebhookEventsTableExists,
      usageEventsTableExists: triggerizabilityTableCoverage.usageEventsTableExists,
    })

    return triggerizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceTriggerizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageTriggerizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.triggerizabilityStatusService.getWorkspaceTriggerizabilityInventory(
        workspaceId,
      )
    const records = buildTriggerizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.triggerizabilityStatusService.pingPostgres()
    const stats = buildTriggerizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return triggerizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveTriggerizabilityAdminActions(),
      guidance: getTriggerizabilityAdminGuidance({ stats }),
    })
  }

  async executeTriggerizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_triggerizability_summary'
    },
  ) {
    this.assertCanManageTriggerizability(authContext)

    const payload = triggerizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_triggerizability_summary': {
        const summary = await this.getWorkspaceTriggerizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return triggerizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed triggerizability summary with ${summary.stats.triggerizabilityPercent}% billing notification triggerizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageTriggerizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production triggerizability tools.',
    })
  }
}
