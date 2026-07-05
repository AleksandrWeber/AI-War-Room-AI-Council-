import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getDeliverabilityRolloutGuidance,
  deliverabilityAdminActionRequestSchema,
  deliverabilityAdminActionResponseSchema,
  deliverabilityAdminSummaryResponseSchema,
  deliverabilityCapabilitiesResponseSchema,
  deliverabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildDeliverabilityAdminRecords,
  buildDeliverabilityAdminStats,
  getDeliverabilityAdminGuidance,
  resolveDeliverabilityAdminActions,
} from './deliverability-admin.helpers.js'
import { evaluateDeliverabilityRollout } from './deliverability-rollout.helpers.js'
import { DeliverabilityStatusService } from './deliverability-status.service.js'

@Injectable()
export class DeliverabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly deliverabilityStatusService: DeliverabilityStatusService,
  ) {}

  getCapabilities() {
    return deliverabilityCapabilitiesResponseSchema.parse({
      supportsDeliverabilityRollout: true,
      supportsDeliverabilityAdminTools: true,
      supportsBillingNotificationDeliverabilitySignals: true,
      supportsBillingWebhookDeliverabilitySignals: true,
      guidance: getDeliverabilityRolloutGuidance(),
    })
  }

  async getDeliverabilityRollout() {
    const deliverabilityTableCoverage =
      await this.deliverabilityStatusService.getDeliverabilityTableCoverage()

    const rollout = evaluateDeliverabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.deliverabilityStatusService.pingPostgres(),
      existingDeliverabilityTableCount: deliverabilityTableCoverage.existingDeliverabilityTableCount,
      billingNotificationsTableExists: deliverabilityTableCoverage.billingNotificationsTableExists,
      billingWebhookEventsTableExists: deliverabilityTableCoverage.billingWebhookEventsTableExists,
      usageEventsTableExists: deliverabilityTableCoverage.usageEventsTableExists,
    })

    return deliverabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceDeliverabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageDeliverability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.deliverabilityStatusService.getWorkspaceDeliverabilityInventory(
        workspaceId,
      )
    const records = buildDeliverabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.deliverabilityStatusService.pingPostgres()
    const stats = buildDeliverabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return deliverabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveDeliverabilityAdminActions(),
      guidance: getDeliverabilityAdminGuidance({ stats }),
    })
  }

  async executeDeliverabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_deliverability_summary'
    },
  ) {
    this.assertCanManageDeliverability(authContext)

    const payload = deliverabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_deliverability_summary': {
        const summary = await this.getWorkspaceDeliverabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return deliverabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed deliverability summary with ${summary.stats.deliverabilityPercent}% billing notification deliverability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageDeliverability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production deliverability tools.',
    })
  }
}
