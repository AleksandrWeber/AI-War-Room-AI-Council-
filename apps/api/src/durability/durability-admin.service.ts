import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  durabilityAdminActionRequestSchema,
  durabilityAdminActionResponseSchema,
  durabilityAdminSummaryResponseSchema,
  durabilityCapabilitiesResponseSchema,
  durabilityRolloutResponseSchema,
  getDurabilityRolloutGuidance,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import { IdempotencyService } from '../persistence/idempotency.service.js'
import {
  buildDurabilityAdminRecords,
  buildDurabilityAdminStats,
  getDurabilityAdminGuidance,
  resolveDurabilityAdminActions,
} from './durability-admin.helpers.js'
import { evaluateDurabilityRollout } from './durability-rollout.helpers.js'
import { DurabilityStatusService } from './durability-status.service.js'

@Injectable()
export class DurabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly durabilityStatusService: DurabilityStatusService,
    private readonly idempotencyService: IdempotencyService,
  ) {}

  getCapabilities() {
    return durabilityCapabilitiesResponseSchema.parse({
      supportsDurabilityRollout: true,
      supportsDurabilityAdminTools: true,
      supportsArtifactPersistenceSignals: true,
      supportsRedisPersistenceSignals: true,
      guidance: getDurabilityRolloutGuidance(),
    })
  }

  async getDurabilityRollout() {
    const durabilityTableCoverage =
      await this.durabilityStatusService.getDurabilityTableCoverage()
    const redisBackedPersistence =
      this.idempotencyService.usesRedisBackedReservation()
    const redisConnectivity = redisBackedPersistence
      ? await this.idempotencyService.ping()
      : true

    const rollout = evaluateDurabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.durabilityStatusService.pingPostgres(),
      existingDurabilityTableCount:
        durabilityTableCoverage.existingDurabilityTableCount,
      artifactsTableExists: durabilityTableCoverage.artifactsTableExists,
      redisBackedPersistence,
      redisConnectivity,
    })

    return durabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceDurabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageDurability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.durabilityStatusService.getWorkspaceDurabilityInventory(
        workspaceId,
      )
    const records = buildDurabilityAdminRecords(inventoryItems)
    const postgresConnectivity =
      await this.durabilityStatusService.pingPostgres()
    const stats = buildDurabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return durabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveDurabilityAdminActions(),
      guidance: getDurabilityAdminGuidance({ stats }),
    })
  }

  async executeDurabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_durability_summary'
    },
  ) {
    this.assertCanManageDurability(authContext)

    const payload = durabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_durability_summary': {
        const summary = await this.getWorkspaceDurabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return durabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed durability summary with ${summary.stats.durabilityPercent}% artifact durability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageDurability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production durability tools.',
    })
  }
}
