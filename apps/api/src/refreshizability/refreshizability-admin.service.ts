import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getRefreshizabilityRolloutGuidance,
  refreshizabilityAdminActionRequestSchema,
  refreshizabilityAdminActionResponseSchema,
  refreshizabilityAdminSummaryResponseSchema,
  refreshizabilityCapabilitiesResponseSchema,
  refreshizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildRefreshizabilityAdminRecords,
  buildRefreshizabilityAdminStats,
  getRefreshizabilityAdminGuidance,
  resolveRefreshizabilityAdminActions,
} from './refreshizability-admin.helpers.js'
import { evaluateRefreshizabilityRollout } from './refreshizability-rollout.helpers.js'
import { RefreshizabilityStatusService } from './refreshizability-status.service.js'

@Injectable()
export class RefreshizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly refreshizabilityStatusService: RefreshizabilityStatusService,
  ) {}

  getCapabilities() {
    return refreshizabilityCapabilitiesResponseSchema.parse({
      supportsRefreshizabilityRollout: true,
      supportsRefreshizabilityAdminTools: true,
      supportsBillingWebhookRefreshizabilitySignals: true,
      supportsBillingRecordRefreshizabilitySignals: true,
      guidance: getRefreshizabilityRolloutGuidance(),
    })
  }

  async getRefreshizabilityRollout() {
    const refreshizabilityTableCoverage =
      await this.refreshizabilityStatusService.getRefreshizabilityTableCoverage()

    const rollout = evaluateRefreshizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.refreshizabilityStatusService.pingPostgres(),
      existingRefreshizabilityTableCount: refreshizabilityTableCoverage.existingRefreshizabilityTableCount,
      billingWebhookEventsTableExists: refreshizabilityTableCoverage.billingWebhookEventsTableExists,
      billingRecordsTableExists: refreshizabilityTableCoverage.billingRecordsTableExists,
      usageEventsTableExists: refreshizabilityTableCoverage.usageEventsTableExists,
    })

    return refreshizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceRefreshizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageRefreshizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.refreshizabilityStatusService.getWorkspaceRefreshizabilityInventory(
        workspaceId,
      )
    const records = buildRefreshizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.refreshizabilityStatusService.pingPostgres()
    const stats = buildRefreshizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return refreshizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveRefreshizabilityAdminActions(),
      guidance: getRefreshizabilityAdminGuidance({ stats }),
    })
  }

  async executeRefreshizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_refreshizability_summary'
    },
  ) {
    this.assertCanManageRefreshizability(authContext)

    const payload = refreshizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_refreshizability_summary': {
        const summary = await this.getWorkspaceRefreshizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return refreshizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed refreshizability summary with ${summary.stats.refreshizabilityPercent}% billing webhook refreshizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageRefreshizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production refreshizability tools.',
    })
  }
}
