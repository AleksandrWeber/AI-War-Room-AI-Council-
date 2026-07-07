import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getAuditregistryizabilityRolloutGuidance,
  auditregistryizabilityAdminActionRequestSchema,
  auditregistryizabilityAdminActionResponseSchema,
  auditregistryizabilityAdminSummaryResponseSchema,
  auditregistryizabilityCapabilitiesResponseSchema,
  auditregistryizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildAuditregistryizabilityAdminRecords,
  buildAuditregistryizabilityAdminStats,
  getAuditregistryizabilityAdminGuidance,
  resolveAuditregistryizabilityAdminActions,
} from './auditregistryizability-admin.helpers.js'
import { evaluateAuditregistryizabilityRollout } from './auditregistryizability-rollout.helpers.js'
import { AuditregistryizabilityStatusService } from './auditregistryizability-status.service.js'

@Injectable()
export class AuditregistryizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly auditregistryizabilityStatusService: AuditregistryizabilityStatusService,
  ) {}

  getCapabilities() {
    return auditregistryizabilityCapabilitiesResponseSchema.parse({
      supportsAuditregistryizabilityRollout: true,
      supportsAuditregistryizabilityAdminTools: true,
      supportsBillingNotificationAuditregistryizabilitySignals: true,
      supportsBillingWebhookAuditregistryizabilitySignals: true,
      guidance: getAuditregistryizabilityRolloutGuidance(),
    })
  }

  async getAuditregistryizabilityRollout() {
    const auditregistryizabilityTableCoverage =
      await this.auditregistryizabilityStatusService.getAuditregistryizabilityTableCoverage()

    const rollout = evaluateAuditregistryizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.auditregistryizabilityStatusService.pingPostgres(),
      existingAuditregistryizabilityTableCount: auditregistryizabilityTableCoverage.existingAuditregistryizabilityTableCount,
      billingNotificationsTableExists: auditregistryizabilityTableCoverage.billingNotificationsTableExists,
      billingWebhookEventsTableExists: auditregistryizabilityTableCoverage.billingWebhookEventsTableExists,
      usageEventsTableExists: auditregistryizabilityTableCoverage.usageEventsTableExists,
    })

    return auditregistryizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceAuditregistryizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageAuditregistryizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.auditregistryizabilityStatusService.getWorkspaceAuditregistryizabilityInventory(
        workspaceId,
      )
    const records = buildAuditregistryizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.auditregistryizabilityStatusService.pingPostgres()
    const stats = buildAuditregistryizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return auditregistryizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveAuditregistryizabilityAdminActions(),
      guidance: getAuditregistryizabilityAdminGuidance({ stats }),
    })
  }

  async executeAuditregistryizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_auditregistryizability_summary'
    },
  ) {
    this.assertCanManageAuditregistryizability(authContext)

    const payload = auditregistryizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_auditregistryizability_summary': {
        const summary = await this.getWorkspaceAuditregistryizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return auditregistryizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed auditregistryizability summary with ${summary.stats.auditregistryizabilityPercent}% billing notification auditregistryizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageAuditregistryizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production auditregistryizability tools.',
    })
  }
}
