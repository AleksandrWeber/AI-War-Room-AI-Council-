import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getCredibilityRolloutGuidance,
  credibilityAdminActionRequestSchema,
  credibilityAdminActionResponseSchema,
  credibilityAdminSummaryResponseSchema,
  credibilityCapabilitiesResponseSchema,
  credibilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildCredibilityAdminRecords,
  buildCredibilityAdminStats,
  getCredibilityAdminGuidance,
  resolveCredibilityAdminActions,
} from './credibility-admin.helpers.js'
import { evaluateCredibilityRollout } from './credibility-rollout.helpers.js'
import { CredibilityStatusService } from './credibility-status.service.js'

@Injectable()
export class CredibilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly credibilityStatusService: CredibilityStatusService,
  ) {}

  getCapabilities() {
    return credibilityCapabilitiesResponseSchema.parse({
      supportsCredibilityRollout: true,
      supportsCredibilityAdminTools: true,
      supportsBillingInvoiceCredibilitySignals: true,
      supportsBillingRecordCredibilitySignals: true,
      guidance: getCredibilityRolloutGuidance(),
    })
  }

  async getCredibilityRollout() {
    const credibilityTableCoverage =
      await this.credibilityStatusService.getCredibilityTableCoverage()

    const rollout = evaluateCredibilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.credibilityStatusService.pingPostgres(),
      existingCredibilityTableCount: credibilityTableCoverage.existingCredibilityTableCount,
      billingInvoicesTableExists: credibilityTableCoverage.billingInvoicesTableExists,
      billingRecordsTableExists: credibilityTableCoverage.billingRecordsTableExists,
      billingMeterUsageReportsTableExists: credibilityTableCoverage.billingMeterUsageReportsTableExists,
    })

    return credibilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceCredibilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageCredibility(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.credibilityStatusService.getWorkspaceCredibilityInventory(
        workspaceId,
      )
    const records = buildCredibilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.credibilityStatusService.pingPostgres()
    const stats = buildCredibilityAdminStats({
      records,
      postgresConnectivity,
    })

    return credibilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveCredibilityAdminActions(),
      guidance: getCredibilityAdminGuidance({ stats }),
    })
  }

  async executeCredibilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_credibility_summary'
    },
  ) {
    this.assertCanManageCredibility(authContext)

    const payload = credibilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_credibility_summary': {
        const summary = await this.getWorkspaceCredibilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return credibilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed credibility summary with ${summary.stats.credibilityPercent}% billing invoice credibility across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageCredibility(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production credibility tools.',
    })
  }
}
