import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getSubscribizabilityRolloutGuidance,
  subscribizabilityAdminActionRequestSchema,
  subscribizabilityAdminActionResponseSchema,
  subscribizabilityAdminSummaryResponseSchema,
  subscribizabilityCapabilitiesResponseSchema,
  subscribizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildSubscribizabilityAdminRecords,
  buildSubscribizabilityAdminStats,
  getSubscribizabilityAdminGuidance,
  resolveSubscribizabilityAdminActions,
} from './subscribizability-admin.helpers.js'
import { evaluateSubscribizabilityRollout } from './subscribizability-rollout.helpers.js'
import { SubscribizabilityStatusService } from './subscribizability-status.service.js'

@Injectable()
export class SubscribizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly subscribizabilityStatusService: SubscribizabilityStatusService,
  ) {}

  getCapabilities() {
    return subscribizabilityCapabilitiesResponseSchema.parse({
      supportsSubscribizabilityRollout: true,
      supportsSubscribizabilityAdminTools: true,
      supportsBillingWebhookSubscribizabilitySignals: true,
      supportsBillingRecordSubscribizabilitySignals: true,
      guidance: getSubscribizabilityRolloutGuidance(),
    })
  }

  async getSubscribizabilityRollout() {
    const subscribizabilityTableCoverage =
      await this.subscribizabilityStatusService.getSubscribizabilityTableCoverage()

    const rollout = evaluateSubscribizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.subscribizabilityStatusService.pingPostgres(),
      existingSubscribizabilityTableCount: subscribizabilityTableCoverage.existingSubscribizabilityTableCount,
      billingWebhookEventsTableExists: subscribizabilityTableCoverage.billingWebhookEventsTableExists,
      billingRecordsTableExists: subscribizabilityTableCoverage.billingRecordsTableExists,
      usageEventsTableExists: subscribizabilityTableCoverage.usageEventsTableExists,
    })

    return subscribizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceSubscribizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageSubscribizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.subscribizabilityStatusService.getWorkspaceSubscribizabilityInventory(
        workspaceId,
      )
    const records = buildSubscribizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.subscribizabilityStatusService.pingPostgres()
    const stats = buildSubscribizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return subscribizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveSubscribizabilityAdminActions(),
      guidance: getSubscribizabilityAdminGuidance({ stats }),
    })
  }

  async executeSubscribizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_subscribizability_summary'
    },
  ) {
    this.assertCanManageSubscribizability(authContext)

    const payload = subscribizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_subscribizability_summary': {
        const summary = await this.getWorkspaceSubscribizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return subscribizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed subscribizability summary with ${summary.stats.subscribizabilityPercent}% billing webhook subscribizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageSubscribizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production subscribizability tools.',
    })
  }
}
