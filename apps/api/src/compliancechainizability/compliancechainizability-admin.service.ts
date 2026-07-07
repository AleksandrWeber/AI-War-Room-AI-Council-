import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getCompliancechainizabilityRolloutGuidance,
  compliancechainizabilityAdminActionRequestSchema,
  compliancechainizabilityAdminActionResponseSchema,
  compliancechainizabilityAdminSummaryResponseSchema,
  compliancechainizabilityCapabilitiesResponseSchema,
  compliancechainizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildCompliancechainizabilityAdminRecords,
  buildCompliancechainizabilityAdminStats,
  getCompliancechainizabilityAdminGuidance,
  resolveCompliancechainizabilityAdminActions,
} from './compliancechainizability-admin.helpers.js'
import { evaluateCompliancechainizabilityRollout } from './compliancechainizability-rollout.helpers.js'
import { CompliancechainizabilityStatusService } from './compliancechainizability-status.service.js'

@Injectable()
export class CompliancechainizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly compliancechainizabilityStatusService: CompliancechainizabilityStatusService,
  ) {}

  getCapabilities() {
    return compliancechainizabilityCapabilitiesResponseSchema.parse({
      supportsCompliancechainizabilityRollout: true,
      supportsCompliancechainizabilityAdminTools: true,
      supportsBillingInvoiceCompliancechainizabilitySignals: true,
      supportsBillingRecordCompliancechainizabilitySignals: true,
      guidance: getCompliancechainizabilityRolloutGuidance(),
    })
  }

  async getCompliancechainizabilityRollout() {
    const compliancechainizabilityTableCoverage =
      await this.compliancechainizabilityStatusService.getCompliancechainizabilityTableCoverage()

    const rollout = evaluateCompliancechainizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.compliancechainizabilityStatusService.pingPostgres(),
      existingCompliancechainizabilityTableCount: compliancechainizabilityTableCoverage.existingCompliancechainizabilityTableCount,
      billingInvoicesTableExists: compliancechainizabilityTableCoverage.billingInvoicesTableExists,
      billingRecordsTableExists: compliancechainizabilityTableCoverage.billingRecordsTableExists,
      billingWebhookEventsTableExists: compliancechainizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return compliancechainizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceCompliancechainizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageCompliancechainizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.compliancechainizabilityStatusService.getWorkspaceCompliancechainizabilityInventory(
        workspaceId,
      )
    const records = buildCompliancechainizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.compliancechainizabilityStatusService.pingPostgres()
    const stats = buildCompliancechainizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return compliancechainizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveCompliancechainizabilityAdminActions(),
      guidance: getCompliancechainizabilityAdminGuidance({ stats }),
    })
  }

  async executeCompliancechainizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_compliancechainizability_summary'
    },
  ) {
    this.assertCanManageCompliancechainizability(authContext)

    const payload = compliancechainizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_compliancechainizability_summary': {
        const summary = await this.getWorkspaceCompliancechainizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return compliancechainizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed compliancechainizability summary with ${summary.stats.compliancechainizabilityPercent}% billing invoice compliancechainizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageCompliancechainizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production compliancechainizability tools.',
    })
  }
}
