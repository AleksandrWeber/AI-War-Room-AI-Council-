import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getProfitabilityRolloutGuidance,
  profitabilityAdminActionRequestSchema,
  profitabilityAdminActionResponseSchema,
  profitabilityAdminSummaryResponseSchema,
  profitabilityCapabilitiesResponseSchema,
  profitabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildProfitabilityAdminRecords,
  buildProfitabilityAdminStats,
  getProfitabilityAdminGuidance,
  resolveProfitabilityAdminActions,
} from './profitability-admin.helpers.js'
import { evaluateProfitabilityRollout } from './profitability-rollout.helpers.js'
import { ProfitabilityStatusService } from './profitability-status.service.js'

@Injectable()
export class ProfitabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly profitabilityStatusService: ProfitabilityStatusService,
  ) {}

  getCapabilities() {
    return profitabilityCapabilitiesResponseSchema.parse({
      supportsProfitabilityRollout: true,
      supportsProfitabilityAdminTools: true,
      supportsBillingRecordProfitabilitySignals: true,
      supportsBillingInvoiceProfitabilitySignals: true,
      guidance: getProfitabilityRolloutGuidance(),
    })
  }

  async getProfitabilityRollout() {
    const profitabilityTableCoverage =
      await this.profitabilityStatusService.getProfitabilityTableCoverage()

    const rollout = evaluateProfitabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.profitabilityStatusService.pingPostgres(),
      existingProfitabilityTableCount: profitabilityTableCoverage.existingProfitabilityTableCount,
      billingRecordsTableExists: profitabilityTableCoverage.billingRecordsTableExists,
      billingInvoicesTableExists: profitabilityTableCoverage.billingInvoicesTableExists,
      billingMeterUsageReportsTableExists: profitabilityTableCoverage.billingMeterUsageReportsTableExists,
    })

    return profitabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceProfitabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageProfitability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.profitabilityStatusService.getWorkspaceProfitabilityInventory(
        workspaceId,
      )
    const records = buildProfitabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.profitabilityStatusService.pingPostgres()
    const stats = buildProfitabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return profitabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveProfitabilityAdminActions(),
      guidance: getProfitabilityAdminGuidance({ stats }),
    })
  }

  async executeProfitabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_profitability_summary'
    },
  ) {
    this.assertCanManageProfitability(authContext)

    const payload = profitabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_profitability_summary': {
        const summary = await this.getWorkspaceProfitabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return profitabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed profitability summary with ${summary.stats.profitabilityPercent}% billing record profitability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageProfitability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production profitability tools.',
    })
  }
}
