import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getCompactionizabilityRolloutGuidance,
  compactionizabilityAdminActionRequestSchema,
  compactionizabilityAdminActionResponseSchema,
  compactionizabilityAdminSummaryResponseSchema,
  compactionizabilityCapabilitiesResponseSchema,
  compactionizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildCompactionizabilityAdminRecords,
  buildCompactionizabilityAdminStats,
  getCompactionizabilityAdminGuidance,
  resolveCompactionizabilityAdminActions,
} from './compactionizability-admin.helpers.js'
import { evaluateCompactionizabilityRollout } from './compactionizability-rollout.helpers.js'
import { CompactionizabilityStatusService } from './compactionizability-status.service.js'

@Injectable()
export class CompactionizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly compactionizabilityStatusService: CompactionizabilityStatusService,
  ) {}

  getCapabilities() {
    return compactionizabilityCapabilitiesResponseSchema.parse({
      supportsCompactionizabilityRollout: true,
      supportsCompactionizabilityAdminTools: true,
      supportsBillingWebhookCompactionizabilitySignals: true,
      supportsBillingRecordCompactionizabilitySignals: true,
      guidance: getCompactionizabilityRolloutGuidance(),
    })
  }

  async getCompactionizabilityRollout() {
    const compactionizabilityTableCoverage =
      await this.compactionizabilityStatusService.getCompactionizabilityTableCoverage()

    const rollout = evaluateCompactionizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.compactionizabilityStatusService.pingPostgres(),
      existingCompactionizabilityTableCount: compactionizabilityTableCoverage.existingCompactionizabilityTableCount,
      billingWebhookEventsTableExists: compactionizabilityTableCoverage.billingWebhookEventsTableExists,
      billingRecordsTableExists: compactionizabilityTableCoverage.billingRecordsTableExists,
      usageEventsTableExists: compactionizabilityTableCoverage.usageEventsTableExists,
    })

    return compactionizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceCompactionizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageCompactionizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.compactionizabilityStatusService.getWorkspaceCompactionizabilityInventory(
        workspaceId,
      )
    const records = buildCompactionizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.compactionizabilityStatusService.pingPostgres()
    const stats = buildCompactionizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return compactionizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveCompactionizabilityAdminActions(),
      guidance: getCompactionizabilityAdminGuidance({ stats }),
    })
  }

  async executeCompactionizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_compactionizability_summary'
    },
  ) {
    this.assertCanManageCompactionizability(authContext)

    const payload = compactionizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_compactionizability_summary': {
        const summary = await this.getWorkspaceCompactionizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return compactionizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed compactionizability summary with ${summary.stats.compactionizabilityPercent}% billing webhook compactionizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageCompactionizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production compactionizability tools.',
    })
  }
}
