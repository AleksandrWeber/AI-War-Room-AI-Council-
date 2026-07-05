import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getComparabilityRolloutGuidance,
  comparabilityAdminActionRequestSchema,
  comparabilityAdminActionResponseSchema,
  comparabilityAdminSummaryResponseSchema,
  comparabilityCapabilitiesResponseSchema,
  comparabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildComparabilityAdminRecords,
  buildComparabilityAdminStats,
  getComparabilityAdminGuidance,
  resolveComparabilityAdminActions,
} from './comparability-admin.helpers.js'
import { evaluateComparabilityRollout } from './comparability-rollout.helpers.js'
import { ComparabilityStatusService } from './comparability-status.service.js'

@Injectable()
export class ComparabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly comparabilityStatusService: ComparabilityStatusService,
  ) {}

  getCapabilities() {
    return comparabilityCapabilitiesResponseSchema.parse({
      supportsComparabilityRollout: true,
      supportsComparabilityAdminTools: true,
      supportsBillingInvoiceComparabilitySignals: true,
      supportsBillingRecordComparabilitySignals: true,
      guidance: getComparabilityRolloutGuidance(),
    })
  }

  async getComparabilityRollout() {
    const comparabilityTableCoverage =
      await this.comparabilityStatusService.getComparabilityTableCoverage()

    const rollout = evaluateComparabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.comparabilityStatusService.pingPostgres(),
      existingComparabilityTableCount: comparabilityTableCoverage.existingComparabilityTableCount,
      billingInvoicesTableExists: comparabilityTableCoverage.billingInvoicesTableExists,
      billingRecordsTableExists: comparabilityTableCoverage.billingRecordsTableExists,
      billingMeterUsageReportsTableExists: comparabilityTableCoverage.billingMeterUsageReportsTableExists,
    })

    return comparabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceComparabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageComparability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.comparabilityStatusService.getWorkspaceComparabilityInventory(
        workspaceId,
      )
    const records = buildComparabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.comparabilityStatusService.pingPostgres()
    const stats = buildComparabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return comparabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveComparabilityAdminActions(),
      guidance: getComparabilityAdminGuidance({ stats }),
    })
  }

  async executeComparabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_comparability_summary'
    },
  ) {
    this.assertCanManageComparability(authContext)

    const payload = comparabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_comparability_summary': {
        const summary = await this.getWorkspaceComparabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return comparabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed comparability summary with ${summary.stats.comparabilityPercent}% billing invoice comparability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageComparability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production comparability tools.',
    })
  }
}
