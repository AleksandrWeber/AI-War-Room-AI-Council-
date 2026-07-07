import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getAuditjournalizabilityRolloutGuidance,
  auditjournalizabilityAdminActionRequestSchema,
  auditjournalizabilityAdminActionResponseSchema,
  auditjournalizabilityAdminSummaryResponseSchema,
  auditjournalizabilityCapabilitiesResponseSchema,
  auditjournalizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildAuditjournalizabilityAdminRecords,
  buildAuditjournalizabilityAdminStats,
  getAuditjournalizabilityAdminGuidance,
  resolveAuditjournalizabilityAdminActions,
} from './auditjournalizability-admin.helpers.js'
import { evaluateAuditjournalizabilityRollout } from './auditjournalizability-rollout.helpers.js'
import { AuditjournalizabilityStatusService } from './auditjournalizability-status.service.js'

@Injectable()
export class AuditjournalizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly auditjournalizabilityStatusService: AuditjournalizabilityStatusService,
  ) {}

  getCapabilities() {
    return auditjournalizabilityCapabilitiesResponseSchema.parse({
      supportsAuditjournalizabilityRollout: true,
      supportsAuditjournalizabilityAdminTools: true,
      supportsBillingNotificationAuditjournalizabilitySignals: true,
      supportsBillingWebhookAuditjournalizabilitySignals: true,
      guidance: getAuditjournalizabilityRolloutGuidance(),
    })
  }

  async getAuditjournalizabilityRollout() {
    const auditjournalizabilityTableCoverage =
      await this.auditjournalizabilityStatusService.getAuditjournalizabilityTableCoverage()

    const rollout = evaluateAuditjournalizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.auditjournalizabilityStatusService.pingPostgres(),
      existingAuditjournalizabilityTableCount: auditjournalizabilityTableCoverage.existingAuditjournalizabilityTableCount,
      billingNotificationsTableExists: auditjournalizabilityTableCoverage.billingNotificationsTableExists,
      billingWebhookEventsTableExists: auditjournalizabilityTableCoverage.billingWebhookEventsTableExists,
      usageEventsTableExists: auditjournalizabilityTableCoverage.usageEventsTableExists,
    })

    return auditjournalizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceAuditjournalizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageAuditjournalizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.auditjournalizabilityStatusService.getWorkspaceAuditjournalizabilityInventory(
        workspaceId,
      )
    const records = buildAuditjournalizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.auditjournalizabilityStatusService.pingPostgres()
    const stats = buildAuditjournalizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return auditjournalizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveAuditjournalizabilityAdminActions(),
      guidance: getAuditjournalizabilityAdminGuidance({ stats }),
    })
  }

  async executeAuditjournalizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_auditjournalizability_summary'
    },
  ) {
    this.assertCanManageAuditjournalizability(authContext)

    const payload = auditjournalizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_auditjournalizability_summary': {
        const summary = await this.getWorkspaceAuditjournalizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return auditjournalizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed auditjournalizability summary with ${summary.stats.auditjournalizabilityPercent}% billing notification auditjournalizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageAuditjournalizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production auditjournalizability tools.',
    })
  }
}
