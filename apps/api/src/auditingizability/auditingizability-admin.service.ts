import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getAuditingizabilityRolloutGuidance,
  auditingizabilityAdminActionRequestSchema,
  auditingizabilityAdminActionResponseSchema,
  auditingizabilityAdminSummaryResponseSchema,
  auditingizabilityCapabilitiesResponseSchema,
  auditingizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildAuditingizabilityAdminRecords,
  buildAuditingizabilityAdminStats,
  getAuditingizabilityAdminGuidance,
  resolveAuditingizabilityAdminActions,
} from './auditingizability-admin.helpers.js'
import { evaluateAuditingizabilityRollout } from './auditingizability-rollout.helpers.js'
import { AuditingizabilityStatusService } from './auditingizability-status.service.js'

@Injectable()
export class AuditingizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly auditingizabilityStatusService: AuditingizabilityStatusService,
  ) {}

  getCapabilities() {
    return auditingizabilityCapabilitiesResponseSchema.parse({
      supportsAuditingizabilityRollout: true,
      supportsAuditingizabilityAdminTools: true,
      supportsBillingInvoiceAuditingizabilitySignals: true,
      supportsBillingRecordAuditingizabilitySignals: true,
      guidance: getAuditingizabilityRolloutGuidance(),
    })
  }

  async getAuditingizabilityRollout() {
    const auditingizabilityTableCoverage =
      await this.auditingizabilityStatusService.getAuditingizabilityTableCoverage()

    const rollout = evaluateAuditingizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.auditingizabilityStatusService.pingPostgres(),
      existingAuditingizabilityTableCount: auditingizabilityTableCoverage.existingAuditingizabilityTableCount,
      billingInvoicesTableExists: auditingizabilityTableCoverage.billingInvoicesTableExists,
      billingRecordsTableExists: auditingizabilityTableCoverage.billingRecordsTableExists,
      billingWebhookEventsTableExists: auditingizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return auditingizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceAuditingizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageAuditingizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.auditingizabilityStatusService.getWorkspaceAuditingizabilityInventory(
        workspaceId,
      )
    const records = buildAuditingizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.auditingizabilityStatusService.pingPostgres()
    const stats = buildAuditingizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return auditingizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveAuditingizabilityAdminActions(),
      guidance: getAuditingizabilityAdminGuidance({ stats }),
    })
  }

  async executeAuditingizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_auditingizability_summary'
    },
  ) {
    this.assertCanManageAuditingizability(authContext)

    const payload = auditingizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_auditingizability_summary': {
        const summary = await this.getWorkspaceAuditingizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return auditingizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed auditingizability summary with ${summary.stats.auditingizabilityPercent}% billing invoice auditingizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageAuditingizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production auditingizability tools.',
    })
  }
}
