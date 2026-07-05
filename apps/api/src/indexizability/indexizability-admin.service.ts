import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getIndexizabilityRolloutGuidance,
  indexizabilityAdminActionRequestSchema,
  indexizabilityAdminActionResponseSchema,
  indexizabilityAdminSummaryResponseSchema,
  indexizabilityCapabilitiesResponseSchema,
  indexizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildIndexizabilityAdminRecords,
  buildIndexizabilityAdminStats,
  getIndexizabilityAdminGuidance,
  resolveIndexizabilityAdminActions,
} from './indexizability-admin.helpers.js'
import { evaluateIndexizabilityRollout } from './indexizability-rollout.helpers.js'
import { IndexizabilityStatusService } from './indexizability-status.service.js'

@Injectable()
export class IndexizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly indexizabilityStatusService: IndexizabilityStatusService,
  ) {}

  getCapabilities() {
    return indexizabilityCapabilitiesResponseSchema.parse({
      supportsIndexizabilityRollout: true,
      supportsIndexizabilityAdminTools: true,
      supportsIdempotencyKeyIndexizabilitySignals: true,
      supportsUsageEventIndexizabilitySignals: true,
      guidance: getIndexizabilityRolloutGuidance(),
    })
  }

  async getIndexizabilityRollout() {
    const indexizabilityTableCoverage =
      await this.indexizabilityStatusService.getIndexizabilityTableCoverage()

    const rollout = evaluateIndexizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.indexizabilityStatusService.pingPostgres(),
      existingIndexizabilityTableCount: indexizabilityTableCoverage.existingIndexizabilityTableCount,
      idempotencyKeysTableExists: indexizabilityTableCoverage.idempotencyKeysTableExists,
      usageEventsTableExists: indexizabilityTableCoverage.usageEventsTableExists,
      billingWebhookEventsTableExists: indexizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return indexizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceIndexizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageIndexizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.indexizabilityStatusService.getWorkspaceIndexizabilityInventory(
        workspaceId,
      )
    const records = buildIndexizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.indexizabilityStatusService.pingPostgres()
    const stats = buildIndexizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return indexizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveIndexizabilityAdminActions(),
      guidance: getIndexizabilityAdminGuidance({ stats }),
    })
  }

  async executeIndexizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_indexizability_summary'
    },
  ) {
    this.assertCanManageIndexizability(authContext)

    const payload = indexizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_indexizability_summary': {
        const summary = await this.getWorkspaceIndexizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return indexizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed indexizability summary with ${summary.stats.indexizabilityPercent}% idempotency key indexizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageIndexizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production indexizability tools.',
    })
  }
}
