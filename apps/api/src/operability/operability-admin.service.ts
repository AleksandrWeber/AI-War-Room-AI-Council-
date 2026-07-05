import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getOperabilityRolloutGuidance,
  operabilityAdminActionRequestSchema,
  operabilityAdminActionResponseSchema,
  operabilityAdminSummaryResponseSchema,
  operabilityCapabilitiesResponseSchema,
  operabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildOperabilityAdminRecords,
  buildOperabilityAdminStats,
  getOperabilityAdminGuidance,
  resolveOperabilityAdminActions,
} from './operability-admin.helpers.js'
import { evaluateOperabilityRollout } from './operability-rollout.helpers.js'
import { OperabilityStatusService } from './operability-status.service.js'

@Injectable()
export class OperabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly operabilityStatusService: OperabilityStatusService,
  ) {}

  getCapabilities() {
    return operabilityCapabilitiesResponseSchema.parse({
      supportsOperabilityRollout: true,
      supportsOperabilityAdminTools: true,
      supportsBillingNotificationOperabilitySignals: true,
      supportsBillingWebhookOperabilitySignals: true,
      guidance: getOperabilityRolloutGuidance(),
    })
  }

  async getOperabilityRollout() {
    const operabilityTableCoverage =
      await this.operabilityStatusService.getOperabilityTableCoverage()

    const rollout = evaluateOperabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.operabilityStatusService.pingPostgres(),
      existingOperabilityTableCount: operabilityTableCoverage.existingOperabilityTableCount,
      billingNotificationsTableExists: operabilityTableCoverage.billingNotificationsTableExists,
      billingWebhookEventsTableExists: operabilityTableCoverage.billingWebhookEventsTableExists,
      billingRecordsTableExists: operabilityTableCoverage.billingRecordsTableExists,
    })

    return operabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceOperabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageOperability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.operabilityStatusService.getWorkspaceOperabilityInventory(
        workspaceId,
      )
    const records = buildOperabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.operabilityStatusService.pingPostgres()
    const stats = buildOperabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return operabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveOperabilityAdminActions(),
      guidance: getOperabilityAdminGuidance({ stats }),
    })
  }

  async executeOperabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_operability_summary'
    },
  ) {
    this.assertCanManageOperability(authContext)

    const payload = operabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_operability_summary': {
        const summary = await this.getWorkspaceOperabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return operabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed operability summary with ${summary.stats.operabilityPercent}% billing notification operability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageOperability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production operability tools.',
    })
  }
}
