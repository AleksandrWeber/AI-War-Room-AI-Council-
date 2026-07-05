import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getReliabilityRolloutGuidance,
  reliabilityAdminActionRequestSchema,
  reliabilityAdminActionResponseSchema,
  reliabilityAdminSummaryResponseSchema,
  reliabilityCapabilitiesResponseSchema,
  reliabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import { IdempotencyService } from '../persistence/idempotency.service.js'
import {
  buildReliabilityAdminRecords,
  buildReliabilityAdminStats,
  getReliabilityAdminGuidance,
  resolveReliabilityAdminActions,
} from './reliability-admin.helpers.js'
import { evaluateReliabilityRollout } from './reliability-rollout.helpers.js'
import { ReliabilityStatusService } from './reliability-status.service.js'

@Injectable()
export class ReliabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly reliabilityStatusService: ReliabilityStatusService,
    private readonly idempotencyService: IdempotencyService,
  ) {}

  getCapabilities() {
    return reliabilityCapabilitiesResponseSchema.parse({
      supportsReliabilityRollout: true,
      supportsReliabilityAdminTools: true,
      supportsModelHealthReliabilitySignals: true,
      supportsIdempotencyFaultTolerance: true,
      guidance: getReliabilityRolloutGuidance(),
    })
  }

  async getReliabilityRollout() {
    const reliabilityTableCoverage =
      await this.reliabilityStatusService.getReliabilityTableCoverage()
    const usesRedisBackedReservation =
      this.idempotencyService.usesRedisBackedReservation()
    const redisConnectivity = usesRedisBackedReservation
      ? await this.idempotencyService.ping()
      : true

    const rollout = evaluateReliabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.reliabilityStatusService.pingPostgres(),
      existingReliabilityTableCount:
        reliabilityTableCoverage.existingReliabilityTableCount,
      modelHealthEventTableExists:
        reliabilityTableCoverage.modelHealthEventTableExists,
      usesRedisBackedReservation,
      redisConnectivity,
      supportsDuplicateRequestProtection: true,
    })

    return reliabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceReliabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageReliability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.reliabilityStatusService.getWorkspaceReliabilityInventory(
        workspaceId,
      )
    const records = buildReliabilityAdminRecords(inventoryItems)
    const postgresConnectivity =
      await this.reliabilityStatusService.pingPostgres()
    const stats = buildReliabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return reliabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveReliabilityAdminActions(),
      guidance: getReliabilityAdminGuidance({ stats }),
    })
  }

  async executeReliabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_reliability_summary'
    },
  ) {
    this.assertCanManageReliability(authContext)

    const payload = reliabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_reliability_summary': {
        const summary = await this.getWorkspaceReliabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return reliabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed reliability summary with ${summary.stats.reliabilityPercent}% run reliability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageReliability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production reliability tools.',
    })
  }
}
