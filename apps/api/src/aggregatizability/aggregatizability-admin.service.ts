import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getAggregatizabilityRolloutGuidance,
  aggregatizabilityAdminActionRequestSchema,
  aggregatizabilityAdminActionResponseSchema,
  aggregatizabilityAdminSummaryResponseSchema,
  aggregatizabilityCapabilitiesResponseSchema,
  aggregatizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildAggregatizabilityAdminRecords,
  buildAggregatizabilityAdminStats,
  getAggregatizabilityAdminGuidance,
  resolveAggregatizabilityAdminActions,
} from './aggregatizability-admin.helpers.js'
import { evaluateAggregatizabilityRollout } from './aggregatizability-rollout.helpers.js'
import { AggregatizabilityStatusService } from './aggregatizability-status.service.js'

@Injectable()
export class AggregatizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly aggregatizabilityStatusService: AggregatizabilityStatusService,
  ) {}

  getCapabilities() {
    return aggregatizabilityCapabilitiesResponseSchema.parse({
      supportsAggregatizabilityRollout: true,
      supportsAggregatizabilityAdminTools: true,
      supportsProviderCredentialAggregatizabilitySignals: true,
      supportsModelRegistryAggregatizabilitySignals: true,
      guidance: getAggregatizabilityRolloutGuidance(),
    })
  }

  async getAggregatizabilityRollout() {
    const aggregatizabilityTableCoverage =
      await this.aggregatizabilityStatusService.getAggregatizabilityTableCoverage()

    const rollout = evaluateAggregatizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.aggregatizabilityStatusService.pingPostgres(),
      existingAggregatizabilityTableCount: aggregatizabilityTableCoverage.existingAggregatizabilityTableCount,
      workspaceProviderCredentialsTableExists: aggregatizabilityTableCoverage.workspaceProviderCredentialsTableExists,
      modelRegistryEntriesTableExists: aggregatizabilityTableCoverage.modelRegistryEntriesTableExists,
      billingWebhookEventsTableExists: aggregatizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return aggregatizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceAggregatizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageAggregatizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.aggregatizabilityStatusService.getWorkspaceAggregatizabilityInventory(
        workspaceId,
      )
    const records = buildAggregatizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.aggregatizabilityStatusService.pingPostgres()
    const stats = buildAggregatizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return aggregatizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveAggregatizabilityAdminActions(),
      guidance: getAggregatizabilityAdminGuidance({ stats }),
    })
  }

  async executeAggregatizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_aggregatizability_summary'
    },
  ) {
    this.assertCanManageAggregatizability(authContext)

    const payload = aggregatizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_aggregatizability_summary': {
        const summary = await this.getWorkspaceAggregatizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return aggregatizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed aggregatizability summary with ${summary.stats.aggregatizabilityPercent}% provider credential aggregatizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageAggregatizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production aggregatizability tools.',
    })
  }
}
