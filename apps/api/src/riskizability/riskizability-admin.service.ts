import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getRiskizabilityRolloutGuidance,
  riskizabilityAdminActionRequestSchema,
  riskizabilityAdminActionResponseSchema,
  riskizabilityAdminSummaryResponseSchema,
  riskizabilityCapabilitiesResponseSchema,
  riskizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildRiskizabilityAdminRecords,
  buildRiskizabilityAdminStats,
  getRiskizabilityAdminGuidance,
  resolveRiskizabilityAdminActions,
} from './riskizability-admin.helpers.js'
import { evaluateRiskizabilityRollout } from './riskizability-rollout.helpers.js'
import { RiskizabilityStatusService } from './riskizability-status.service.js'

@Injectable()
export class RiskizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly riskizabilityStatusService: RiskizabilityStatusService,
  ) {}

  getCapabilities() {
    return riskizabilityCapabilitiesResponseSchema.parse({
      supportsRiskizabilityRollout: true,
      supportsRiskizabilityAdminTools: true,
      supportsBillingInvoiceRiskizabilitySignals: true,
      supportsBillingRecordRiskizabilitySignals: true,
      guidance: getRiskizabilityRolloutGuidance(),
    })
  }

  async getRiskizabilityRollout() {
    const riskizabilityTableCoverage =
      await this.riskizabilityStatusService.getRiskizabilityTableCoverage()

    const rollout = evaluateRiskizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.riskizabilityStatusService.pingPostgres(),
      existingRiskizabilityTableCount: riskizabilityTableCoverage.existingRiskizabilityTableCount,
      billingInvoicesTableExists: riskizabilityTableCoverage.billingInvoicesTableExists,
      billingRecordsTableExists: riskizabilityTableCoverage.billingRecordsTableExists,
      billingWebhookEventsTableExists: riskizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return riskizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceRiskizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageRiskizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.riskizabilityStatusService.getWorkspaceRiskizabilityInventory(
        workspaceId,
      )
    const records = buildRiskizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.riskizabilityStatusService.pingPostgres()
    const stats = buildRiskizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return riskizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveRiskizabilityAdminActions(),
      guidance: getRiskizabilityAdminGuidance({ stats }),
    })
  }

  async executeRiskizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_riskizability_summary'
    },
  ) {
    this.assertCanManageRiskizability(authContext)

    const payload = riskizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_riskizability_summary': {
        const summary = await this.getWorkspaceRiskizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return riskizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed riskizability summary with ${summary.stats.riskizabilityPercent}% billing invoice riskizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageRiskizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production riskizability tools.',
    })
  }
}
