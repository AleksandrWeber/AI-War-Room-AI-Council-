import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getAuditabilityRolloutGuidance,
  auditabilityAdminActionRequestSchema,
  auditabilityAdminActionResponseSchema,
  auditabilityAdminSummaryResponseSchema,
  auditabilityCapabilitiesResponseSchema,
  auditabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildAuditabilityAdminRecords,
  buildAuditabilityAdminStats,
  getAuditabilityAdminGuidance,
  resolveAuditabilityAdminActions,
} from './auditability-admin.helpers.js'
import { evaluateAuditabilityRollout } from './auditability-rollout.helpers.js'
import { AuditabilityStatusService } from './auditability-status.service.js'

@Injectable()
export class AuditabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly auditabilityStatusService: AuditabilityStatusService,
  ) {}

  getCapabilities() {
    return auditabilityCapabilitiesResponseSchema.parse({
      supportsAuditabilityRollout: true,
      supportsAuditabilityAdminTools: true,
      supportsUsageAuditabilitySignals: true,
      supportsBillingWebhookAuditabilitySignals: true,
      guidance: getAuditabilityRolloutGuidance(),
    })
  }

  async getAuditabilityRollout() {
    const auditabilityTableCoverage =
      await this.auditabilityStatusService.getAuditabilityTableCoverage()

    const rollout = evaluateAuditabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.auditabilityStatusService.pingPostgres(),
      existingAuditabilityTableCount: auditabilityTableCoverage.existingAuditabilityTableCount,
      usageEventsTableExists: auditabilityTableCoverage.usageEventsTableExists,
      billingWebhookEventsTableExists: auditabilityTableCoverage.billingWebhookEventsTableExists,
      billingNotificationsTableExists: auditabilityTableCoverage.billingNotificationsTableExists,
    })

    return auditabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceAuditabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageAuditability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.auditabilityStatusService.getWorkspaceAuditabilityInventory(
        workspaceId,
      )
    const records = buildAuditabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.auditabilityStatusService.pingPostgres()
    const stats = buildAuditabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return auditabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveAuditabilityAdminActions(),
      guidance: getAuditabilityAdminGuidance({ stats }),
    })
  }

  async executeAuditabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_auditability_summary'
    },
  ) {
    this.assertCanManageAuditability(authContext)

    const payload = auditabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_auditability_summary': {
        const summary = await this.getWorkspaceAuditabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return auditabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed auditability summary with ${summary.stats.auditabilityPercent}% usage auditability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageAuditability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production auditability tools.',
    })
  }
}
