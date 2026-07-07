import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getCompliancejournalizabilityRolloutGuidance,
  compliancejournalizabilityAdminActionRequestSchema,
  compliancejournalizabilityAdminActionResponseSchema,
  compliancejournalizabilityAdminSummaryResponseSchema,
  compliancejournalizabilityCapabilitiesResponseSchema,
  compliancejournalizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildCompliancejournalizabilityAdminRecords,
  buildCompliancejournalizabilityAdminStats,
  getCompliancejournalizabilityAdminGuidance,
  resolveCompliancejournalizabilityAdminActions,
} from './compliancejournalizability-admin.helpers.js'
import { evaluateCompliancejournalizabilityRollout } from './compliancejournalizability-rollout.helpers.js'
import { CompliancejournalizabilityStatusService } from './compliancejournalizability-status.service.js'

@Injectable()
export class CompliancejournalizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly compliancejournalizabilityStatusService: CompliancejournalizabilityStatusService,
  ) {}

  getCapabilities() {
    return compliancejournalizabilityCapabilitiesResponseSchema.parse({
      supportsCompliancejournalizabilityRollout: true,
      supportsCompliancejournalizabilityAdminTools: true,
      supportsBillingInvoiceCompliancejournalizabilitySignals: true,
      supportsBillingRecordCompliancejournalizabilitySignals: true,
      guidance: getCompliancejournalizabilityRolloutGuidance(),
    })
  }

  async getCompliancejournalizabilityRollout() {
    const compliancejournalizabilityTableCoverage =
      await this.compliancejournalizabilityStatusService.getCompliancejournalizabilityTableCoverage()

    const rollout = evaluateCompliancejournalizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.compliancejournalizabilityStatusService.pingPostgres(),
      existingCompliancejournalizabilityTableCount: compliancejournalizabilityTableCoverage.existingCompliancejournalizabilityTableCount,
      billingInvoicesTableExists: compliancejournalizabilityTableCoverage.billingInvoicesTableExists,
      billingRecordsTableExists: compliancejournalizabilityTableCoverage.billingRecordsTableExists,
      billingWebhookEventsTableExists: compliancejournalizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return compliancejournalizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceCompliancejournalizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageCompliancejournalizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.compliancejournalizabilityStatusService.getWorkspaceCompliancejournalizabilityInventory(
        workspaceId,
      )
    const records = buildCompliancejournalizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.compliancejournalizabilityStatusService.pingPostgres()
    const stats = buildCompliancejournalizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return compliancejournalizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveCompliancejournalizabilityAdminActions(),
      guidance: getCompliancejournalizabilityAdminGuidance({ stats }),
    })
  }

  async executeCompliancejournalizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_compliancejournalizability_summary'
    },
  ) {
    this.assertCanManageCompliancejournalizability(authContext)

    const payload = compliancejournalizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_compliancejournalizability_summary': {
        const summary = await this.getWorkspaceCompliancejournalizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return compliancejournalizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed compliancejournalizability summary with ${summary.stats.compliancejournalizabilityPercent}% billing invoice compliancejournalizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageCompliancejournalizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production compliancejournalizability tools.',
    })
  }
}
