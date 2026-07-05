import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getSplitizabilityRolloutGuidance,
  splitizabilityAdminActionRequestSchema,
  splitizabilityAdminActionResponseSchema,
  splitizabilityAdminSummaryResponseSchema,
  splitizabilityCapabilitiesResponseSchema,
  splitizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildSplitizabilityAdminRecords,
  buildSplitizabilityAdminStats,
  getSplitizabilityAdminGuidance,
  resolveSplitizabilityAdminActions,
} from './splitizability-admin.helpers.js'
import { evaluateSplitizabilityRollout } from './splitizability-rollout.helpers.js'
import { SplitizabilityStatusService } from './splitizability-status.service.js'

@Injectable()
export class SplitizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly splitizabilityStatusService: SplitizabilityStatusService,
  ) {}

  getCapabilities() {
    return splitizabilityCapabilitiesResponseSchema.parse({
      supportsSplitizabilityRollout: true,
      supportsSplitizabilityAdminTools: true,
      supportsBillingInvoiceSplitizabilitySignals: true,
      supportsBillingRecordSplitizabilitySignals: true,
      guidance: getSplitizabilityRolloutGuidance(),
    })
  }

  async getSplitizabilityRollout() {
    const splitizabilityTableCoverage =
      await this.splitizabilityStatusService.getSplitizabilityTableCoverage()

    const rollout = evaluateSplitizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.splitizabilityStatusService.pingPostgres(),
      existingSplitizabilityTableCount: splitizabilityTableCoverage.existingSplitizabilityTableCount,
      billingInvoicesTableExists: splitizabilityTableCoverage.billingInvoicesTableExists,
      billingRecordsTableExists: splitizabilityTableCoverage.billingRecordsTableExists,
      billingWebhookEventsTableExists: splitizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return splitizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceSplitizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageSplitizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.splitizabilityStatusService.getWorkspaceSplitizabilityInventory(
        workspaceId,
      )
    const records = buildSplitizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.splitizabilityStatusService.pingPostgres()
    const stats = buildSplitizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return splitizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveSplitizabilityAdminActions(),
      guidance: getSplitizabilityAdminGuidance({ stats }),
    })
  }

  async executeSplitizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_splitizability_summary'
    },
  ) {
    this.assertCanManageSplitizability(authContext)

    const payload = splitizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_splitizability_summary': {
        const summary = await this.getWorkspaceSplitizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return splitizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed splitizability summary with ${summary.stats.splitizabilityPercent}% billing invoice splitizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageSplitizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production splitizability tools.',
    })
  }
}
