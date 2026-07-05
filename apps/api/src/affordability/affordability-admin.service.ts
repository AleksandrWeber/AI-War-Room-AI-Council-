import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getAffordabilityRolloutGuidance,
  affordabilityAdminActionRequestSchema,
  affordabilityAdminActionResponseSchema,
  affordabilityAdminSummaryResponseSchema,
  affordabilityCapabilitiesResponseSchema,
  affordabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildAffordabilityAdminRecords,
  buildAffordabilityAdminStats,
  getAffordabilityAdminGuidance,
  resolveAffordabilityAdminActions,
} from './affordability-admin.helpers.js'
import { evaluateAffordabilityRollout } from './affordability-rollout.helpers.js'
import { AffordabilityStatusService } from './affordability-status.service.js'

@Injectable()
export class AffordabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly affordabilityStatusService: AffordabilityStatusService,
  ) {}

  getCapabilities() {
    return affordabilityCapabilitiesResponseSchema.parse({
      supportsAffordabilityRollout: true,
      supportsAffordabilityAdminTools: true,
      supportsBillingInvoiceAffordabilitySignals: true,
      supportsBillingRecordAffordabilitySignals: true,
      guidance: getAffordabilityRolloutGuidance(),
    })
  }

  async getAffordabilityRollout() {
    const affordabilityTableCoverage =
      await this.affordabilityStatusService.getAffordabilityTableCoverage()

    const rollout = evaluateAffordabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.affordabilityStatusService.pingPostgres(),
      existingAffordabilityTableCount: affordabilityTableCoverage.existingAffordabilityTableCount,
      billingInvoicesTableExists: affordabilityTableCoverage.billingInvoicesTableExists,
      billingRecordsTableExists: affordabilityTableCoverage.billingRecordsTableExists,
      workspaceUsageLimitsTableExists: affordabilityTableCoverage.workspaceUsageLimitsTableExists,
    })

    return affordabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceAffordabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageAffordability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.affordabilityStatusService.getWorkspaceAffordabilityInventory(
        workspaceId,
      )
    const records = buildAffordabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.affordabilityStatusService.pingPostgres()
    const stats = buildAffordabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return affordabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveAffordabilityAdminActions(),
      guidance: getAffordabilityAdminGuidance({ stats }),
    })
  }

  async executeAffordabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_affordability_summary'
    },
  ) {
    this.assertCanManageAffordability(authContext)

    const payload = affordabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_affordability_summary': {
        const summary = await this.getWorkspaceAffordabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return affordabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed affordability summary with ${summary.stats.affordabilityPercent}% billing invoice affordability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageAffordability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production affordability tools.',
    })
  }
}
