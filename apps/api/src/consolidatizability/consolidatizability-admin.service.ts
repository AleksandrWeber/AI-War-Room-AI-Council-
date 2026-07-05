import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getConsolidatizabilityRolloutGuidance,
  consolidatizabilityAdminActionRequestSchema,
  consolidatizabilityAdminActionResponseSchema,
  consolidatizabilityAdminSummaryResponseSchema,
  consolidatizabilityCapabilitiesResponseSchema,
  consolidatizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildConsolidatizabilityAdminRecords,
  buildConsolidatizabilityAdminStats,
  getConsolidatizabilityAdminGuidance,
  resolveConsolidatizabilityAdminActions,
} from './consolidatizability-admin.helpers.js'
import { evaluateConsolidatizabilityRollout } from './consolidatizability-rollout.helpers.js'
import { ConsolidatizabilityStatusService } from './consolidatizability-status.service.js'

@Injectable()
export class ConsolidatizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly consolidatizabilityStatusService: ConsolidatizabilityStatusService,
  ) {}

  getCapabilities() {
    return consolidatizabilityCapabilitiesResponseSchema.parse({
      supportsConsolidatizabilityRollout: true,
      supportsConsolidatizabilityAdminTools: true,
      supportsBillingWebhookConsolidatizabilitySignals: true,
      supportsBillingRecordConsolidatizabilitySignals: true,
      guidance: getConsolidatizabilityRolloutGuidance(),
    })
  }

  async getConsolidatizabilityRollout() {
    const consolidatizabilityTableCoverage =
      await this.consolidatizabilityStatusService.getConsolidatizabilityTableCoverage()

    const rollout = evaluateConsolidatizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.consolidatizabilityStatusService.pingPostgres(),
      existingConsolidatizabilityTableCount: consolidatizabilityTableCoverage.existingConsolidatizabilityTableCount,
      billingWebhookEventsTableExists: consolidatizabilityTableCoverage.billingWebhookEventsTableExists,
      billingRecordsTableExists: consolidatizabilityTableCoverage.billingRecordsTableExists,
      usageEventsTableExists: consolidatizabilityTableCoverage.usageEventsTableExists,
    })

    return consolidatizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceConsolidatizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageConsolidatizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.consolidatizabilityStatusService.getWorkspaceConsolidatizabilityInventory(
        workspaceId,
      )
    const records = buildConsolidatizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.consolidatizabilityStatusService.pingPostgres()
    const stats = buildConsolidatizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return consolidatizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveConsolidatizabilityAdminActions(),
      guidance: getConsolidatizabilityAdminGuidance({ stats }),
    })
  }

  async executeConsolidatizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_consolidatizability_summary'
    },
  ) {
    this.assertCanManageConsolidatizability(authContext)

    const payload = consolidatizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_consolidatizability_summary': {
        const summary = await this.getWorkspaceConsolidatizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return consolidatizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed consolidatizability summary with ${summary.stats.consolidatizabilityPercent}% billing webhook consolidatizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageConsolidatizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production consolidatizability tools.',
    })
  }
}
