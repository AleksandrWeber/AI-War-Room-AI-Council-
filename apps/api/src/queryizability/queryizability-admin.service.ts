import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getQueryizabilityRolloutGuidance,
  queryizabilityAdminActionRequestSchema,
  queryizabilityAdminActionResponseSchema,
  queryizabilityAdminSummaryResponseSchema,
  queryizabilityCapabilitiesResponseSchema,
  queryizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildQueryizabilityAdminRecords,
  buildQueryizabilityAdminStats,
  getQueryizabilityAdminGuidance,
  resolveQueryizabilityAdminActions,
} from './queryizability-admin.helpers.js'
import { evaluateQueryizabilityRollout } from './queryizability-rollout.helpers.js'
import { QueryizabilityStatusService } from './queryizability-status.service.js'

@Injectable()
export class QueryizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly queryizabilityStatusService: QueryizabilityStatusService,
  ) {}

  getCapabilities() {
    return queryizabilityCapabilitiesResponseSchema.parse({
      supportsQueryizabilityRollout: true,
      supportsQueryizabilityAdminTools: true,
      supportsBillingWebhookQueryizabilitySignals: true,
      supportsBillingRecordQueryizabilitySignals: true,
      guidance: getQueryizabilityRolloutGuidance(),
    })
  }

  async getQueryizabilityRollout() {
    const queryizabilityTableCoverage =
      await this.queryizabilityStatusService.getQueryizabilityTableCoverage()

    const rollout = evaluateQueryizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.queryizabilityStatusService.pingPostgres(),
      existingQueryizabilityTableCount: queryizabilityTableCoverage.existingQueryizabilityTableCount,
      billingWebhookEventsTableExists: queryizabilityTableCoverage.billingWebhookEventsTableExists,
      billingRecordsTableExists: queryizabilityTableCoverage.billingRecordsTableExists,
      usageEventsTableExists: queryizabilityTableCoverage.usageEventsTableExists,
    })

    return queryizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceQueryizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageQueryizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.queryizabilityStatusService.getWorkspaceQueryizabilityInventory(
        workspaceId,
      )
    const records = buildQueryizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.queryizabilityStatusService.pingPostgres()
    const stats = buildQueryizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return queryizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveQueryizabilityAdminActions(),
      guidance: getQueryizabilityAdminGuidance({ stats }),
    })
  }

  async executeQueryizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_queryizability_summary'
    },
  ) {
    this.assertCanManageQueryizability(authContext)

    const payload = queryizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_queryizability_summary': {
        const summary = await this.getWorkspaceQueryizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return queryizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed queryizability summary with ${summary.stats.queryizabilityPercent}% billing webhook queryizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageQueryizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production queryizability tools.',
    })
  }
}
