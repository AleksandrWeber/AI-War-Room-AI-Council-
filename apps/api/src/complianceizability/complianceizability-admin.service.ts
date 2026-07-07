import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getComplianceizabilityRolloutGuidance,
  complianceizabilityAdminActionRequestSchema,
  complianceizabilityAdminActionResponseSchema,
  complianceizabilityAdminSummaryResponseSchema,
  complianceizabilityCapabilitiesResponseSchema,
  complianceizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildComplianceizabilityAdminRecords,
  buildComplianceizabilityAdminStats,
  getComplianceizabilityAdminGuidance,
  resolveComplianceizabilityAdminActions,
} from './complianceizability-admin.helpers.js'
import { evaluateComplianceizabilityRollout } from './complianceizability-rollout.helpers.js'
import { ComplianceizabilityStatusService } from './complianceizability-status.service.js'

@Injectable()
export class ComplianceizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly complianceizabilityStatusService: ComplianceizabilityStatusService,
  ) {}

  getCapabilities() {
    return complianceizabilityCapabilitiesResponseSchema.parse({
      supportsComplianceizabilityRollout: true,
      supportsComplianceizabilityAdminTools: true,
      supportsBillingInvoiceComplianceizabilitySignals: true,
      supportsBillingRecordComplianceizabilitySignals: true,
      guidance: getComplianceizabilityRolloutGuidance(),
    })
  }

  async getComplianceizabilityRollout() {
    const complianceizabilityTableCoverage =
      await this.complianceizabilityStatusService.getComplianceizabilityTableCoverage()

    const rollout = evaluateComplianceizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.complianceizabilityStatusService.pingPostgres(),
      existingComplianceizabilityTableCount: complianceizabilityTableCoverage.existingComplianceizabilityTableCount,
      billingInvoicesTableExists: complianceizabilityTableCoverage.billingInvoicesTableExists,
      billingRecordsTableExists: complianceizabilityTableCoverage.billingRecordsTableExists,
      billingWebhookEventsTableExists: complianceizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return complianceizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceComplianceizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageComplianceizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.complianceizabilityStatusService.getWorkspaceComplianceizabilityInventory(
        workspaceId,
      )
    const records = buildComplianceizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.complianceizabilityStatusService.pingPostgres()
    const stats = buildComplianceizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return complianceizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveComplianceizabilityAdminActions(),
      guidance: getComplianceizabilityAdminGuidance({ stats }),
    })
  }

  async executeComplianceizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_complianceizability_summary'
    },
  ) {
    this.assertCanManageComplianceizability(authContext)

    const payload = complianceizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_complianceizability_summary': {
        const summary = await this.getWorkspaceComplianceizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return complianceizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed complianceizability summary with ${summary.stats.complianceizabilityPercent}% billing invoice complianceizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageComplianceizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production complianceizability tools.',
    })
  }
}
