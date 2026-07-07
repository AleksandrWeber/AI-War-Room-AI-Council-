import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getComplianceledgerizabilityRolloutGuidance,
  complianceledgerizabilityAdminActionRequestSchema,
  complianceledgerizabilityAdminActionResponseSchema,
  complianceledgerizabilityAdminSummaryResponseSchema,
  complianceledgerizabilityCapabilitiesResponseSchema,
  complianceledgerizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildComplianceledgerizabilityAdminRecords,
  buildComplianceledgerizabilityAdminStats,
  getComplianceledgerizabilityAdminGuidance,
  resolveComplianceledgerizabilityAdminActions,
} from './complianceledgerizability-admin.helpers.js'
import { evaluateComplianceledgerizabilityRollout } from './complianceledgerizability-rollout.helpers.js'
import { ComplianceledgerizabilityStatusService } from './complianceledgerizability-status.service.js'

@Injectable()
export class ComplianceledgerizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly complianceledgerizabilityStatusService: ComplianceledgerizabilityStatusService,
  ) {}

  getCapabilities() {
    return complianceledgerizabilityCapabilitiesResponseSchema.parse({
      supportsComplianceledgerizabilityRollout: true,
      supportsComplianceledgerizabilityAdminTools: true,
      supportsBillingInvoiceComplianceledgerizabilitySignals: true,
      supportsBillingRecordComplianceledgerizabilitySignals: true,
      guidance: getComplianceledgerizabilityRolloutGuidance(),
    })
  }

  async getComplianceledgerizabilityRollout() {
    const complianceledgerizabilityTableCoverage =
      await this.complianceledgerizabilityStatusService.getComplianceledgerizabilityTableCoverage()

    const rollout = evaluateComplianceledgerizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.complianceledgerizabilityStatusService.pingPostgres(),
      existingComplianceledgerizabilityTableCount: complianceledgerizabilityTableCoverage.existingComplianceledgerizabilityTableCount,
      billingInvoicesTableExists: complianceledgerizabilityTableCoverage.billingInvoicesTableExists,
      billingRecordsTableExists: complianceledgerizabilityTableCoverage.billingRecordsTableExists,
      billingWebhookEventsTableExists: complianceledgerizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return complianceledgerizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceComplianceledgerizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageComplianceledgerizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.complianceledgerizabilityStatusService.getWorkspaceComplianceledgerizabilityInventory(
        workspaceId,
      )
    const records = buildComplianceledgerizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.complianceledgerizabilityStatusService.pingPostgres()
    const stats = buildComplianceledgerizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return complianceledgerizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveComplianceledgerizabilityAdminActions(),
      guidance: getComplianceledgerizabilityAdminGuidance({ stats }),
    })
  }

  async executeComplianceledgerizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_complianceledgerizability_summary'
    },
  ) {
    this.assertCanManageComplianceledgerizability(authContext)

    const payload = complianceledgerizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_complianceledgerizability_summary': {
        const summary = await this.getWorkspaceComplianceledgerizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return complianceledgerizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed complianceledgerizability summary with ${summary.stats.complianceledgerizabilityPercent}% billing invoice complianceledgerizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageComplianceledgerizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production complianceledgerizability tools.',
    })
  }
}
