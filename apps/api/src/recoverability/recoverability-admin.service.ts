import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getRecoverabilityRolloutGuidance,
  recoverabilityAdminActionRequestSchema,
  recoverabilityAdminActionResponseSchema,
  recoverabilityAdminSummaryResponseSchema,
  recoverabilityCapabilitiesResponseSchema,
  recoverabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import { IdempotencyService } from '../persistence/idempotency.service.js'
import { StreamEventBufferService } from '../persistence/stream-event-buffer.service.js'
import {
  buildRecoverabilityAdminRecords,
  buildRecoverabilityAdminStats,
  getRecoverabilityAdminGuidance,
  resolveRecoverabilityAdminActions,
} from './recoverability-admin.helpers.js'
import { evaluateRecoverabilityRollout } from './recoverability-rollout.helpers.js'
import { RecoverabilityStatusService } from './recoverability-status.service.js'

@Injectable()
export class RecoverabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly recoverabilityStatusService: RecoverabilityStatusService,
    private readonly idempotencyService: IdempotencyService,
    private readonly streamEventBufferService: StreamEventBufferService,
  ) {}

  getCapabilities() {
    return recoverabilityCapabilitiesResponseSchema.parse({
      supportsRecoverabilityRollout: true,
      supportsRecoverabilityAdminTools: true,
      supportsRunWorkflowRecoverySignals: true,
      supportsStreamRecoverySignals: true,
      guidance: getRecoverabilityRolloutGuidance(),
    })
  }

  async getRecoverabilityRollout() {
    const recoverabilityTableCoverage =
      await this.recoverabilityStatusService.getRecoverabilityTableCoverage()
    const redisBackedRecoverySignals =
      this.idempotencyService.usesRedisBackedReservation() ||
      this.streamEventBufferService.usesRedisBackedBuffer()
    const redisConnectivity = redisBackedRecoverySignals
      ? await this.idempotencyService.ping()
      : true

    const rollout = evaluateRecoverabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity:
        await this.recoverabilityStatusService.pingPostgres(),
      existingRecoverabilityTableCount:
        recoverabilityTableCoverage.existingRecoverabilityTableCount,
      runWorkflowsTableExists:
        recoverabilityTableCoverage.runWorkflowsTableExists,
      redisBackedRecoverySignals,
      redisConnectivity,
      supportsDuplicateRequestProtection: true,
    })

    return recoverabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceRecoverabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageRecoverability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.recoverabilityStatusService.getWorkspaceRecoverabilityInventory(
        workspaceId,
      )
    const records = buildRecoverabilityAdminRecords(inventoryItems)
    const postgresConnectivity =
      await this.recoverabilityStatusService.pingPostgres()
    const stats = buildRecoverabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return recoverabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveRecoverabilityAdminActions(),
      guidance: getRecoverabilityAdminGuidance({ stats }),
    })
  }

  async executeRecoverabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_recoverability_summary'
    },
  ) {
    this.assertCanManageRecoverability(authContext)

    const payload = recoverabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_recoverability_summary': {
        const summary = await this.getWorkspaceRecoverabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return recoverabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed recoverability summary with ${summary.stats.recoverabilityPercent}% run recoverability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageRecoverability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production recoverability tools.',
    })
  }
}
