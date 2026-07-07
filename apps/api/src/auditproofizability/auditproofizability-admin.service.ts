import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getAuditproofizabilityRolloutGuidance,
  auditproofizabilityAdminActionRequestSchema,
  auditproofizabilityAdminActionResponseSchema,
  auditproofizabilityAdminSummaryResponseSchema,
  auditproofizabilityCapabilitiesResponseSchema,
  auditproofizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildAuditproofizabilityAdminRecords,
  buildAuditproofizabilityAdminStats,
  getAuditproofizabilityAdminGuidance,
  resolveAuditproofizabilityAdminActions,
} from './auditproofizability-admin.helpers.js'
import { evaluateAuditproofizabilityRollout } from './auditproofizability-rollout.helpers.js'
import { AuditproofizabilityStatusService } from './auditproofizability-status.service.js'

@Injectable()
export class AuditproofizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly auditproofizabilityStatusService: AuditproofizabilityStatusService,
  ) {}

  getCapabilities() {
    return auditproofizabilityCapabilitiesResponseSchema.parse({
      supportsAuditproofizabilityRollout: true,
      supportsAuditproofizabilityAdminTools: true,
      supportsBillingNotificationAuditproofizabilitySignals: true,
      supportsBillingWebhookAuditproofizabilitySignals: true,
      guidance: getAuditproofizabilityRolloutGuidance(),
    })
  }

  async getAuditproofizabilityRollout() {
    const auditproofizabilityTableCoverage =
      await this.auditproofizabilityStatusService.getAuditproofizabilityTableCoverage()

    const rollout = evaluateAuditproofizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.auditproofizabilityStatusService.pingPostgres(),
      existingAuditproofizabilityTableCount: auditproofizabilityTableCoverage.existingAuditproofizabilityTableCount,
      billingNotificationsTableExists: auditproofizabilityTableCoverage.billingNotificationsTableExists,
      billingWebhookEventsTableExists: auditproofizabilityTableCoverage.billingWebhookEventsTableExists,
      usageEventsTableExists: auditproofizabilityTableCoverage.usageEventsTableExists,
    })

    return auditproofizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceAuditproofizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageAuditproofizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.auditproofizabilityStatusService.getWorkspaceAuditproofizabilityInventory(
        workspaceId,
      )
    const records = buildAuditproofizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.auditproofizabilityStatusService.pingPostgres()
    const stats = buildAuditproofizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return auditproofizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveAuditproofizabilityAdminActions(),
      guidance: getAuditproofizabilityAdminGuidance({ stats }),
    })
  }

  async executeAuditproofizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_auditproofizability_summary'
    },
  ) {
    this.assertCanManageAuditproofizability(authContext)

    const payload = auditproofizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_auditproofizability_summary': {
        const summary = await this.getWorkspaceAuditproofizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return auditproofizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed auditproofizability summary with ${summary.stats.auditproofizabilityPercent}% billing notification auditproofizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageAuditproofizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production auditproofizability tools.',
    })
  }
}
