import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getResilienceRolloutGuidance,
  resilienceAdminActionRequestSchema,
  resilienceAdminActionResponseSchema,
  resilienceAdminSummaryResponseSchema,
  resilienceCapabilitiesResponseSchema,
  resilienceRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import { MigrationStatusService } from '../migrations/migration-status.service.js'
import { IdempotencyService } from '../persistence/idempotency.service.js'
import { StreamEventBufferService } from '../persistence/stream-event-buffer.service.js'
import {
  buildResilienceAdminRecords,
  buildResilienceAdminStats,
  getResilienceAdminGuidance,
  resolveResilienceAdminActions,
} from './resilience-admin.helpers.js'
import { evaluateResilienceRollout } from './resilience-rollout.helpers.js'
import { ResilienceStatusService } from './resilience-status.service.js'

@Injectable()
export class ResilienceAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly resilienceStatusService: ResilienceStatusService,
    private readonly migrationStatusService: MigrationStatusService,
    private readonly idempotencyService: IdempotencyService,
    private readonly streamEventBufferService: StreamEventBufferService,
  ) {}

  getCapabilities() {
    return resilienceCapabilitiesResponseSchema.parse({
      supportsResilienceRollout: true,
      supportsResilienceAdminTools: true,
      supportsRunWorkflowRecoverySignals: true,
      supportsRedisRecoverySignals: true,
      guidance: getResilienceRolloutGuidance(),
    })
  }

  async getResilienceRollout() {
    const resilienceTableCoverage =
      await this.resilienceStatusService.getResilienceTableCoverage()
    const migrationInventory =
      await this.migrationStatusService.getMigrationInventory()
    const redisBackedRecoverySignals =
      this.idempotencyService.usesRedisBackedReservation() ||
      this.streamEventBufferService.usesRedisBackedBuffer()
    const redisConnectivity = redisBackedRecoverySignals
      ? await this.idempotencyService.ping()
      : true

    const rollout = evaluateResilienceRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.resilienceStatusService.pingPostgres(),
      existingResilienceTableCount:
        resilienceTableCoverage.existingResilienceTableCount,
      redisBackedRecoverySignals,
      redisConnectivity,
      pendingMigrationCount: migrationInventory.pendingVersions.length,
    })

    return resilienceRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceResilienceAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageResilience(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.resilienceStatusService.getWorkspaceResilienceInventory(
        workspaceId,
      )
    const records = buildResilienceAdminRecords(inventoryItems)
    const postgresConnectivity = await this.resilienceStatusService.pingPostgres()
    const stats = buildResilienceAdminStats({
      records,
      postgresConnectivity,
    })

    return resilienceAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveResilienceAdminActions(),
      guidance: getResilienceAdminGuidance({ stats }),
    })
  }

  async executeResilienceAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_resilience_summary'
    },
  ) {
    this.assertCanManageResilience(authContext)

    const payload = resilienceAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_resilience_summary': {
        const summary = await this.getWorkspaceResilienceAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return resilienceAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed resilience summary with ${summary.stats.recoveryReadinessPercent}% recovery readiness across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageResilience(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production resilience tools.',
    })
  }
}
