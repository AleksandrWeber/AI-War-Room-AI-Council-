import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getAdjustabilityRolloutGuidance,
  adjustabilityAdminActionRequestSchema,
  adjustabilityAdminActionResponseSchema,
  adjustabilityAdminSummaryResponseSchema,
  adjustabilityCapabilitiesResponseSchema,
  adjustabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildAdjustabilityAdminRecords,
  buildAdjustabilityAdminStats,
  getAdjustabilityAdminGuidance,
  resolveAdjustabilityAdminActions,
} from './adjustability-admin.helpers.js'
import { evaluateAdjustabilityRollout } from './adjustability-rollout.helpers.js'
import { AdjustabilityStatusService } from './adjustability-status.service.js'

@Injectable()
export class AdjustabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly adjustabilityStatusService: AdjustabilityStatusService,
  ) {}

  getCapabilities() {
    return adjustabilityCapabilitiesResponseSchema.parse({
      supportsAdjustabilityRollout: true,
      supportsAdjustabilityAdminTools: true,
      supportsBillingInvoiceAdjustabilitySignals: true,
      supportsMeterUsageAdjustabilitySignals: true,
      guidance: getAdjustabilityRolloutGuidance(),
    })
  }

  async getAdjustabilityRollout() {
    const adjustabilityTableCoverage =
      await this.adjustabilityStatusService.getAdjustabilityTableCoverage()

    const rollout = evaluateAdjustabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.adjustabilityStatusService.pingPostgres(),
      existingAdjustabilityTableCount: adjustabilityTableCoverage.existingAdjustabilityTableCount,
      billingInvoicesTableExists: adjustabilityTableCoverage.billingInvoicesTableExists,
      billingMeterUsageReportsTableExists: adjustabilityTableCoverage.billingMeterUsageReportsTableExists,
      workspaceMembershipsTableExists: adjustabilityTableCoverage.workspaceMembershipsTableExists,
    })

    return adjustabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceAdjustabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageAdjustability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.adjustabilityStatusService.getWorkspaceAdjustabilityInventory(
        workspaceId,
      )
    const records = buildAdjustabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.adjustabilityStatusService.pingPostgres()
    const stats = buildAdjustabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return adjustabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveAdjustabilityAdminActions(),
      guidance: getAdjustabilityAdminGuidance({ stats }),
    })
  }

  async executeAdjustabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_adjustability_summary'
    },
  ) {
    this.assertCanManageAdjustability(authContext)

    const payload = adjustabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_adjustability_summary': {
        const summary = await this.getWorkspaceAdjustabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return adjustabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed adjustability summary with ${summary.stats.adjustabilityPercent}% billing invoice adjustability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageAdjustability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production adjustability tools.',
    })
  }
}
