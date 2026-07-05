import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getAlertabilizabilityRolloutGuidance,
  alertabilizabilityAdminActionRequestSchema,
  alertabilizabilityAdminActionResponseSchema,
  alertabilizabilityAdminSummaryResponseSchema,
  alertabilizabilityCapabilitiesResponseSchema,
  alertabilizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildAlertabilizabilityAdminRecords,
  buildAlertabilizabilityAdminStats,
  getAlertabilizabilityAdminGuidance,
  resolveAlertabilizabilityAdminActions,
} from './alertabilizability-admin.helpers.js'
import { evaluateAlertabilizabilityRollout } from './alertabilizability-rollout.helpers.js'
import { AlertabilizabilityStatusService } from './alertabilizability-status.service.js'

@Injectable()
export class AlertabilizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly alertabilizabilityStatusService: AlertabilizabilityStatusService,
  ) {}

  getCapabilities() {
    return alertabilizabilityCapabilitiesResponseSchema.parse({
      supportsAlertabilizabilityRollout: true,
      supportsAlertabilizabilityAdminTools: true,
      supportsBillingInvoiceAlertabilizabilitySignals: true,
      supportsBillingRecordAlertabilizabilitySignals: true,
      guidance: getAlertabilizabilityRolloutGuidance(),
    })
  }

  async getAlertabilizabilityRollout() {
    const alertabilizabilityTableCoverage =
      await this.alertabilizabilityStatusService.getAlertabilizabilityTableCoverage()

    const rollout = evaluateAlertabilizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.alertabilizabilityStatusService.pingPostgres(),
      existingAlertabilizabilityTableCount: alertabilizabilityTableCoverage.existingAlertabilizabilityTableCount,
      billingInvoicesTableExists: alertabilizabilityTableCoverage.billingInvoicesTableExists,
      billingRecordsTableExists: alertabilizabilityTableCoverage.billingRecordsTableExists,
      billingWebhookEventsTableExists: alertabilizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return alertabilizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceAlertabilizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageAlertabilizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.alertabilizabilityStatusService.getWorkspaceAlertabilizabilityInventory(
        workspaceId,
      )
    const records = buildAlertabilizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.alertabilizabilityStatusService.pingPostgres()
    const stats = buildAlertabilizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return alertabilizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveAlertabilizabilityAdminActions(),
      guidance: getAlertabilizabilityAdminGuidance({ stats }),
    })
  }

  async executeAlertabilizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_alertabilizability_summary'
    },
  ) {
    this.assertCanManageAlertabilizability(authContext)

    const payload = alertabilizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_alertabilizability_summary': {
        const summary = await this.getWorkspaceAlertabilizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return alertabilizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed alertabilizability summary with ${summary.stats.alertabilizabilityPercent}% billing invoice alertabilizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageAlertabilizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production alertabilizability tools.',
    })
  }
}
