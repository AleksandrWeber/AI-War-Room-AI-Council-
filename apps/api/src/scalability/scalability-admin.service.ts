import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getScalabilityRolloutGuidance,
  scalabilityAdminActionRequestSchema,
  scalabilityAdminActionResponseSchema,
  scalabilityAdminSummaryResponseSchema,
  scalabilityCapabilitiesResponseSchema,
  scalabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import { IdempotencyService } from '../persistence/idempotency.service.js'
import { StreamEventBufferService } from '../persistence/stream-event-buffer.service.js'
import {
  buildScalabilityAdminRecords,
  buildScalabilityAdminStats,
  getScalabilityAdminGuidance,
  resolveScalabilityAdminActions,
} from './scalability-admin.helpers.js'
import { evaluateScalabilityRollout } from './scalability-rollout.helpers.js'
import { ScalabilityStatusService } from './scalability-status.service.js'

@Injectable()
export class ScalabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly scalabilityStatusService: ScalabilityStatusService,
    private readonly idempotencyService: IdempotencyService,
    private readonly streamEventBufferService: StreamEventBufferService,
  ) {}

  getCapabilities() {
    return scalabilityCapabilitiesResponseSchema.parse({
      supportsScalabilityRollout: true,
      supportsScalabilityAdminTools: true,
      supportsWorkspaceGrowthSignals: true,
      supportsUsageLimitScalabilitySignals: true,
      guidance: getScalabilityRolloutGuidance(),
    })
  }

  async getScalabilityRollout() {
    const scalabilityTableCoverage =
      await this.scalabilityStatusService.getScalabilityTableCoverage()
    const redisBackedScalabilitySignals =
      this.idempotencyService.usesRedisBackedReservation() ||
      this.streamEventBufferService.usesRedisBackedBuffer()
    const redisConnectivity = redisBackedScalabilitySignals
      ? await this.idempotencyService.ping()
      : true

    const rollout = evaluateScalabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.scalabilityStatusService.pingPostgres(),
      existingScalabilityTableCount:
        scalabilityTableCoverage.existingScalabilityTableCount,
      usageLimitsTableExists: scalabilityTableCoverage.usageLimitsTableExists,
      workspaceMembershipsTableExists:
        scalabilityTableCoverage.workspaceMembershipsTableExists,
      redisBackedScalabilitySignals,
      redisConnectivity,
    })

    return scalabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceScalabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageScalability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.scalabilityStatusService.getWorkspaceScalabilityInventory(
        workspaceId,
      )
    const records = buildScalabilityAdminRecords(inventoryItems)
    const postgresConnectivity =
      await this.scalabilityStatusService.pingPostgres()
    const stats = buildScalabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return scalabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveScalabilityAdminActions(),
      guidance: getScalabilityAdminGuidance({ stats }),
    })
  }

  async executeScalabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_scalability_summary'
    },
  ) {
    this.assertCanManageScalability(authContext)

    const payload = scalabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_scalability_summary': {
        const summary = await this.getWorkspaceScalabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return scalabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed scalability summary with ${summary.stats.scalabilityPercent}% run scalability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageScalability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production scalability tools.',
    })
  }
}
