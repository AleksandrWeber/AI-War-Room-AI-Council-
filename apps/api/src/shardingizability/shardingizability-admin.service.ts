import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getShardingizabilityRolloutGuidance,
  shardingizabilityAdminActionRequestSchema,
  shardingizabilityAdminActionResponseSchema,
  shardingizabilityAdminSummaryResponseSchema,
  shardingizabilityCapabilitiesResponseSchema,
  shardingizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildShardingizabilityAdminRecords,
  buildShardingizabilityAdminStats,
  getShardingizabilityAdminGuidance,
  resolveShardingizabilityAdminActions,
} from './shardingizability-admin.helpers.js'
import { evaluateShardingizabilityRollout } from './shardingizability-rollout.helpers.js'
import { ShardingizabilityStatusService } from './shardingizability-status.service.js'

@Injectable()
export class ShardingizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly shardingizabilityStatusService: ShardingizabilityStatusService,
  ) {}

  getCapabilities() {
    return shardingizabilityCapabilitiesResponseSchema.parse({
      supportsShardingizabilityRollout: true,
      supportsShardingizabilityAdminTools: true,
      supportsIdempotencyKeyShardingizabilitySignals: true,
      supportsUsageEventShardingizabilitySignals: true,
      guidance: getShardingizabilityRolloutGuidance(),
    })
  }

  async getShardingizabilityRollout() {
    const shardingizabilityTableCoverage =
      await this.shardingizabilityStatusService.getShardingizabilityTableCoverage()

    const rollout = evaluateShardingizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.shardingizabilityStatusService.pingPostgres(),
      existingShardingizabilityTableCount: shardingizabilityTableCoverage.existingShardingizabilityTableCount,
      idempotencyKeysTableExists: shardingizabilityTableCoverage.idempotencyKeysTableExists,
      usageEventsTableExists: shardingizabilityTableCoverage.usageEventsTableExists,
      billingWebhookEventsTableExists: shardingizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return shardingizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceShardingizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageShardingizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.shardingizabilityStatusService.getWorkspaceShardingizabilityInventory(
        workspaceId,
      )
    const records = buildShardingizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.shardingizabilityStatusService.pingPostgres()
    const stats = buildShardingizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return shardingizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveShardingizabilityAdminActions(),
      guidance: getShardingizabilityAdminGuidance({ stats }),
    })
  }

  async executeShardingizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_shardingizability_summary'
    },
  ) {
    this.assertCanManageShardingizability(authContext)

    const payload = shardingizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_shardingizability_summary': {
        const summary = await this.getWorkspaceShardingizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return shardingizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed shardingizability summary with ${summary.stats.shardingizabilityPercent}% idempotency key shardingizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageShardingizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production shardingizability tools.',
    })
  }
}
