import { ForbiddenException, Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getIdempotencyRolloutGuidance,
  idempotencyAdminActionRequestSchema,
  idempotencyAdminActionResponseSchema,
  idempotencyAdminSummaryResponseSchema,
  idempotencyCapabilitiesResponseSchema,
  idempotencyRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import { IdempotencyService } from '../persistence/idempotency.service.js'
import { RUN_REPOSITORY, type RunRepository } from '../persistence/run.repository.js'
import {
  buildIdempotencyAdminRecords,
  buildIdempotencyAdminStats,
  getIdempotencyAdminGuidance,
  resolveIdempotencyAdminActions,
} from './idempotency-admin.helpers.js'
import { evaluateIdempotencyRollout } from './idempotency-rollout.helpers.js'

@Injectable()
export class IdempotencyAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly idempotencyService: IdempotencyService,
    @Inject(RUN_REPOSITORY) private readonly runRepository: RunRepository,
  ) {}

  getCapabilities() {
    return idempotencyCapabilitiesResponseSchema.parse({
      supportsIdempotencyRollout: true,
      supportsIdempotencyAdminTools: true,
      supportsRedisReservations: true,
      defaultReservationTtlSeconds: this.configService.get(
        'IDEMPOTENCY_TTL_SECONDS',
        { infer: true },
      ),
      guidance: getIdempotencyRolloutGuidance(),
    })
  }

  async getIdempotencyRollout() {
    const nodeEnv = this.configService.get('NODE_ENV', { infer: true })
    const usesRedisBackedReservation =
      this.idempotencyService.usesRedisBackedReservation()
    const redisConnectivity = usesRedisBackedReservation
      ? await this.idempotencyService.ping()
      : true
    const rollout = evaluateIdempotencyRollout({
      nodeEnv,
      usesRedisBackedReservation,
      redisConnectivity,
      usesInMemoryRepository: nodeEnv === 'test',
      reservationTtlSeconds: this.configService.get(
        'IDEMPOTENCY_TTL_SECONDS',
        { infer: true },
      ),
      supportsDuplicateRequestProtection: true,
    })

    return idempotencyRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceIdempotencyAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageIdempotency(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const records = buildIdempotencyAdminRecords({
      persistedRecords: await this.runRepository.listIdempotencyRecords(
        workspaceId,
      ),
      activeReservations: await this.idempotencyService.listWorkspaceReservations(
        workspaceId,
      ),
    })
    const stats = buildIdempotencyAdminStats(records)

    return idempotencyAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveIdempotencyAdminActions({ stats }),
      guidance: getIdempotencyAdminGuidance({ stats }),
    })
  }

  async executeIdempotencyAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action:
        | 'refresh_idempotency_summary'
        | 'clear_workspace_idempotency_reservations'
        | 'purge_expired_idempotency_keys'
    },
  ) {
    this.assertCanManageIdempotency(authContext)

    const payload = idempotencyAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_idempotency_summary': {
        const summary = await this.getWorkspaceIdempotencyAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return idempotencyAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed idempotency summary with ${summary.stats.totalKeys} key(s) and ${summary.stats.activeReservations} active reservation(s).`,
          stats: summary.stats,
        })
      }
      case 'clear_workspace_idempotency_reservations': {
        const clearedCount =
          await this.idempotencyService.clearWorkspaceReservations(
            payload.workspaceId,
          )
        const summary = await this.getWorkspaceIdempotencyAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return idempotencyAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Cleared ${clearedCount} active idempotency reservation(s) for this workspace.`,
          stats: summary.stats,
        })
      }
      case 'purge_expired_idempotency_keys': {
        const purgedCount = await this.runRepository.purgeExpiredIdempotencyKeys(
          payload.workspaceId,
        )
        const summary = await this.getWorkspaceIdempotencyAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return idempotencyAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Purged ${purgedCount} expired idempotency key(s) for this workspace.`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageIdempotency(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage idempotency tools.',
    })
  }
}
