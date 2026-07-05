import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  capacityAdminActionRequestSchema,
  capacityAdminActionResponseSchema,
  capacityAdminSummaryResponseSchema,
  capacityCapabilitiesResponseSchema,
  capacityRolloutResponseSchema,
  getCapacityRolloutGuidance,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import { IdempotencyService } from '../persistence/idempotency.service.js'
import { StreamEventBufferService } from '../persistence/stream-event-buffer.service.js'
import {
  buildCapacityAdminRecords,
  buildCapacityAdminStats,
  getCapacityAdminGuidance,
  resolveCapacityAdminActions,
} from './capacity-admin.helpers.js'
import { evaluateCapacityRollout } from './capacity-rollout.helpers.js'
import { CapacityStatusService } from './capacity-status.service.js'

@Injectable()
export class CapacityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly capacityStatusService: CapacityStatusService,
    private readonly idempotencyService: IdempotencyService,
    private readonly streamEventBufferService: StreamEventBufferService,
  ) {}

  getCapabilities() {
    return capacityCapabilitiesResponseSchema.parse({
      supportsCapacityRollout: true,
      supportsCapacityAdminTools: true,
      supportsUsageLimitsCapacitySignals: true,
      supportsRedisCapacitySignals: true,
      guidance: getCapacityRolloutGuidance(),
    })
  }

  async getCapacityRollout() {
    const capacityTableCoverage =
      await this.capacityStatusService.getCapacityTableCoverage()
    const redisBackedCapacitySignals =
      this.idempotencyService.usesRedisBackedReservation() ||
      this.streamEventBufferService.usesRedisBackedBuffer()
    const redisConnectivity = redisBackedCapacitySignals
      ? await this.idempotencyService.ping()
      : true

    const rollout = evaluateCapacityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.capacityStatusService.pingPostgres(),
      existingCapacityTableCount:
        capacityTableCoverage.existingCapacityTableCount,
      redisBackedCapacitySignals,
      redisConnectivity,
      usageLimitsTableExists: capacityTableCoverage.usageLimitsTableExists,
      streamBufferMaxLength:
        this.streamEventBufferService.getStreamBufferMaxLength(),
    })

    return capacityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceCapacityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageCapacity(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.capacityStatusService.getWorkspaceCapacityInventory(
        workspaceId,
      )
    const records = buildCapacityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.capacityStatusService.pingPostgres()
    const stats = buildCapacityAdminStats({
      records,
      postgresConnectivity,
    })

    return capacityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveCapacityAdminActions(),
      guidance: getCapacityAdminGuidance({ stats }),
    })
  }

  async executeCapacityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_capacity_summary'
    },
  ) {
    this.assertCanManageCapacity(authContext)

    const payload = capacityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_capacity_summary': {
        const summary = await this.getWorkspaceCapacityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return capacityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed capacity summary with ${summary.stats.loadUtilizationPercent}% concurrent load utilization across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageCapacity(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production capacity tools.',
    })
  }
}
