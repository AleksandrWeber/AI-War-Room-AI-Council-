import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getSegregationizabilityRolloutGuidance,
  segregationizabilityAdminActionRequestSchema,
  segregationizabilityAdminActionResponseSchema,
  segregationizabilityAdminSummaryResponseSchema,
  segregationizabilityCapabilitiesResponseSchema,
  segregationizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildSegregationizabilityAdminRecords,
  buildSegregationizabilityAdminStats,
  getSegregationizabilityAdminGuidance,
  resolveSegregationizabilityAdminActions,
} from './segregationizability-admin.helpers.js'
import { evaluateSegregationizabilityRollout } from './segregationizability-rollout.helpers.js'
import { SegregationizabilityStatusService } from './segregationizability-status.service.js'

@Injectable()
export class SegregationizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly segregationizabilityStatusService: SegregationizabilityStatusService,
  ) {}

  getCapabilities() {
    return segregationizabilityCapabilitiesResponseSchema.parse({
      supportsSegregationizabilityRollout: true,
      supportsSegregationizabilityAdminTools: true,
      supportsBillingNotificationSegregationizabilitySignals: true,
      supportsBillingWebhookSegregationizabilitySignals: true,
      guidance: getSegregationizabilityRolloutGuidance(),
    })
  }

  async getSegregationizabilityRollout() {
    const segregationizabilityTableCoverage =
      await this.segregationizabilityStatusService.getSegregationizabilityTableCoverage()

    const rollout = evaluateSegregationizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.segregationizabilityStatusService.pingPostgres(),
      existingSegregationizabilityTableCount: segregationizabilityTableCoverage.existingSegregationizabilityTableCount,
      billingNotificationsTableExists: segregationizabilityTableCoverage.billingNotificationsTableExists,
      billingWebhookEventsTableExists: segregationizabilityTableCoverage.billingWebhookEventsTableExists,
      usageEventsTableExists: segregationizabilityTableCoverage.usageEventsTableExists,
    })

    return segregationizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceSegregationizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageSegregationizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.segregationizabilityStatusService.getWorkspaceSegregationizabilityInventory(
        workspaceId,
      )
    const records = buildSegregationizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.segregationizabilityStatusService.pingPostgres()
    const stats = buildSegregationizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return segregationizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveSegregationizabilityAdminActions(),
      guidance: getSegregationizabilityAdminGuidance({ stats }),
    })
  }

  async executeSegregationizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_segregationizability_summary'
    },
  ) {
    this.assertCanManageSegregationizability(authContext)

    const payload = segregationizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_segregationizability_summary': {
        const summary = await this.getWorkspaceSegregationizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return segregationizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed segregationizability summary with ${summary.stats.segregationizabilityPercent}% billing notification segregationizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageSegregationizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production segregationizability tools.',
    })
  }
}
