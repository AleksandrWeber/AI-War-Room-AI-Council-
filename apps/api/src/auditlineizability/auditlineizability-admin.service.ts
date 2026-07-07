import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getAuditlineizabilityRolloutGuidance,
  auditlineizabilityAdminActionRequestSchema,
  auditlineizabilityAdminActionResponseSchema,
  auditlineizabilityAdminSummaryResponseSchema,
  auditlineizabilityCapabilitiesResponseSchema,
  auditlineizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildAuditlineizabilityAdminRecords,
  buildAuditlineizabilityAdminStats,
  getAuditlineizabilityAdminGuidance,
  resolveAuditlineizabilityAdminActions,
} from './auditlineizability-admin.helpers.js'
import { evaluateAuditlineizabilityRollout } from './auditlineizability-rollout.helpers.js'
import { AuditlineizabilityStatusService } from './auditlineizability-status.service.js'

@Injectable()
export class AuditlineizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly auditlineizabilityStatusService: AuditlineizabilityStatusService,
  ) {}

  getCapabilities() {
    return auditlineizabilityCapabilitiesResponseSchema.parse({
      supportsAuditlineizabilityRollout: true,
      supportsAuditlineizabilityAdminTools: true,
      supportsBillingInvoiceAuditlineizabilitySignals: true,
      supportsBillingRecordAuditlineizabilitySignals: true,
      guidance: getAuditlineizabilityRolloutGuidance(),
    })
  }

  async getAuditlineizabilityRollout() {
    const auditlineizabilityTableCoverage =
      await this.auditlineizabilityStatusService.getAuditlineizabilityTableCoverage()

    const rollout = evaluateAuditlineizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.auditlineizabilityStatusService.pingPostgres(),
      existingAuditlineizabilityTableCount: auditlineizabilityTableCoverage.existingAuditlineizabilityTableCount,
      billingInvoicesTableExists: auditlineizabilityTableCoverage.billingInvoicesTableExists,
      billingRecordsTableExists: auditlineizabilityTableCoverage.billingRecordsTableExists,
      billingWebhookEventsTableExists: auditlineizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return auditlineizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceAuditlineizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageAuditlineizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.auditlineizabilityStatusService.getWorkspaceAuditlineizabilityInventory(
        workspaceId,
      )
    const records = buildAuditlineizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.auditlineizabilityStatusService.pingPostgres()
    const stats = buildAuditlineizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return auditlineizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveAuditlineizabilityAdminActions(),
      guidance: getAuditlineizabilityAdminGuidance({ stats }),
    })
  }

  async executeAuditlineizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_auditlineizability_summary'
    },
  ) {
    this.assertCanManageAuditlineizability(authContext)

    const payload = auditlineizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_auditlineizability_summary': {
        const summary = await this.getWorkspaceAuditlineizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return auditlineizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed auditlineizability summary with ${summary.stats.auditlineizabilityPercent}% billing invoice auditlineizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageAuditlineizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production auditlineizability tools.',
    })
  }
}
