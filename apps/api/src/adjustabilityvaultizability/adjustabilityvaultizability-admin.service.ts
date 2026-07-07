import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getAdjustabilityvaultizabilityRolloutGuidance,
  adjustabilityvaultizabilityAdminActionRequestSchema,
  adjustabilityvaultizabilityAdminActionResponseSchema,
  adjustabilityvaultizabilityAdminSummaryResponseSchema,
  adjustabilityvaultizabilityCapabilitiesResponseSchema,
  adjustabilityvaultizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildAdjustabilityvaultizabilityAdminRecords,
  buildAdjustabilityvaultizabilityAdminStats,
  getAdjustabilityvaultizabilityAdminGuidance,
  resolveAdjustabilityvaultizabilityAdminActions,
} from './adjustabilityvaultizability-admin.helpers.js'
import { evaluateAdjustabilityvaultizabilityRollout } from './adjustabilityvaultizability-rollout.helpers.js'
import { AdjustabilityvaultizabilityStatusService } from './adjustabilityvaultizability-status.service.js'

@Injectable()
export class AdjustabilityvaultizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly adjustabilityvaultizabilityStatusService: AdjustabilityvaultizabilityStatusService,
  ) {}

  getCapabilities() {
    return adjustabilityvaultizabilityCapabilitiesResponseSchema.parse({
      supportsAdjustabilityvaultizabilityRollout: true,
      supportsAdjustabilityvaultizabilityAdminTools: true,
      supportsBillingNotificationAdjustabilityvaultizabilitySignals: true,
      supportsBillingWebhookAdjustabilityvaultizabilitySignals: true,
      guidance: getAdjustabilityvaultizabilityRolloutGuidance(),
    })
  }

  async getAdjustabilityvaultizabilityRollout() {
    const adjustabilityvaultizabilityTableCoverage =
      await this.adjustabilityvaultizabilityStatusService.getAdjustabilityvaultizabilityTableCoverage()

    const rollout = evaluateAdjustabilityvaultizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.adjustabilityvaultizabilityStatusService.pingPostgres(),
      existingAdjustabilityvaultizabilityTableCount: adjustabilityvaultizabilityTableCoverage.existingAdjustabilityvaultizabilityTableCount,
      billingNotificationsTableExists: adjustabilityvaultizabilityTableCoverage.billingNotificationsTableExists,
      billingWebhookEventsTableExists: adjustabilityvaultizabilityTableCoverage.billingWebhookEventsTableExists,
      usageEventsTableExists: adjustabilityvaultizabilityTableCoverage.usageEventsTableExists,
    })

    return adjustabilityvaultizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceAdjustabilityvaultizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageAdjustabilityvaultizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.adjustabilityvaultizabilityStatusService.getWorkspaceAdjustabilityvaultizabilityInventory(
        workspaceId,
      )
    const records = buildAdjustabilityvaultizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.adjustabilityvaultizabilityStatusService.pingPostgres()
    const stats = buildAdjustabilityvaultizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return adjustabilityvaultizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveAdjustabilityvaultizabilityAdminActions(),
      guidance: getAdjustabilityvaultizabilityAdminGuidance({ stats }),
    })
  }

  async executeAdjustabilityvaultizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_adjustabilityvaultizability_summary'
    },
  ) {
    this.assertCanManageAdjustabilityvaultizability(authContext)

    const payload = adjustabilityvaultizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_adjustabilityvaultizability_summary': {
        const summary = await this.getWorkspaceAdjustabilityvaultizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return adjustabilityvaultizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed adjustabilityvaultizability summary with ${summary.stats.adjustabilityvaultizabilityPercent}% billing notification adjustabilityvaultizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageAdjustabilityvaultizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production adjustabilityvaultizability tools.',
    })
  }
}
