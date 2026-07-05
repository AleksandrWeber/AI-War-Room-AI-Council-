import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getMulticastizabilityRolloutGuidance,
  multicastizabilityAdminActionRequestSchema,
  multicastizabilityAdminActionResponseSchema,
  multicastizabilityAdminSummaryResponseSchema,
  multicastizabilityCapabilitiesResponseSchema,
  multicastizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildMulticastizabilityAdminRecords,
  buildMulticastizabilityAdminStats,
  getMulticastizabilityAdminGuidance,
  resolveMulticastizabilityAdminActions,
} from './multicastizability-admin.helpers.js'
import { evaluateMulticastizabilityRollout } from './multicastizability-rollout.helpers.js'
import { MulticastizabilityStatusService } from './multicastizability-status.service.js'

@Injectable()
export class MulticastizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly multicastizabilityStatusService: MulticastizabilityStatusService,
  ) {}

  getCapabilities() {
    return multicastizabilityCapabilitiesResponseSchema.parse({
      supportsMulticastizabilityRollout: true,
      supportsMulticastizabilityAdminTools: true,
      supportsBillingNotificationMulticastizabilitySignals: true,
      supportsBillingWebhookMulticastizabilitySignals: true,
      guidance: getMulticastizabilityRolloutGuidance(),
    })
  }

  async getMulticastizabilityRollout() {
    const multicastizabilityTableCoverage =
      await this.multicastizabilityStatusService.getMulticastizabilityTableCoverage()

    const rollout = evaluateMulticastizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.multicastizabilityStatusService.pingPostgres(),
      existingMulticastizabilityTableCount: multicastizabilityTableCoverage.existingMulticastizabilityTableCount,
      billingNotificationsTableExists: multicastizabilityTableCoverage.billingNotificationsTableExists,
      billingWebhookEventsTableExists: multicastizabilityTableCoverage.billingWebhookEventsTableExists,
      usageEventsTableExists: multicastizabilityTableCoverage.usageEventsTableExists,
    })

    return multicastizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceMulticastizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageMulticastizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.multicastizabilityStatusService.getWorkspaceMulticastizabilityInventory(
        workspaceId,
      )
    const records = buildMulticastizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.multicastizabilityStatusService.pingPostgres()
    const stats = buildMulticastizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return multicastizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveMulticastizabilityAdminActions(),
      guidance: getMulticastizabilityAdminGuidance({ stats }),
    })
  }

  async executeMulticastizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_multicastizability_summary'
    },
  ) {
    this.assertCanManageMulticastizability(authContext)

    const payload = multicastizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_multicastizability_summary': {
        const summary = await this.getWorkspaceMulticastizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return multicastizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed multicastizability summary with ${summary.stats.multicastizabilityPercent}% billing notification multicastizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageMulticastizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production multicastizability tools.',
    })
  }
}
