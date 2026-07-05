import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  consistencyAdminActionRequestSchema,
  consistencyAdminActionResponseSchema,
  consistencyAdminSummaryResponseSchema,
  consistencyCapabilitiesResponseSchema,
  consistencyRolloutResponseSchema,
  getConsistencyRolloutGuidance,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import { IdempotencyService } from '../persistence/idempotency.service.js'
import {
  buildConsistencyAdminRecords,
  buildConsistencyAdminStats,
  getConsistencyAdminGuidance,
  resolveConsistencyAdminActions,
} from './consistency-admin.helpers.js'
import { evaluateConsistencyRollout } from './consistency-rollout.helpers.js'
import { ConsistencyStatusService } from './consistency-status.service.js'

@Injectable()
export class ConsistencyAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly consistencyStatusService: ConsistencyStatusService,
    private readonly idempotencyService: IdempotencyService,
  ) {}

  getCapabilities() {
    return consistencyCapabilitiesResponseSchema.parse({
      supportsConsistencyRollout: true,
      supportsConsistencyAdminTools: true,
      supportsRunWorkflowAlignmentSignals: true,
      supportsIdempotencyConsistencySignals: true,
      guidance: getConsistencyRolloutGuidance(),
    })
  }

  async getConsistencyRollout() {
    const consistencyTableCoverage =
      await this.consistencyStatusService.getConsistencyTableCoverage()
    const usesRedisBackedReservation =
      this.idempotencyService.usesRedisBackedReservation()
    const redisConnectivity = usesRedisBackedReservation
      ? await this.idempotencyService.ping()
      : true

    const rollout = evaluateConsistencyRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.consistencyStatusService.pingPostgres(),
      existingConsistencyTableCount:
        consistencyTableCoverage.existingConsistencyTableCount,
      runWorkflowsTableExists:
        consistencyTableCoverage.runWorkflowsTableExists,
      usesRedisBackedReservation,
      redisConnectivity,
      supportsDuplicateRequestProtection: true,
    })

    return consistencyRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceConsistencyAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageConsistency(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.consistencyStatusService.getWorkspaceConsistencyInventory(
        workspaceId,
      )
    const records = buildConsistencyAdminRecords(inventoryItems)
    const postgresConnectivity =
      await this.consistencyStatusService.pingPostgres()
    const stats = buildConsistencyAdminStats({
      records,
      postgresConnectivity,
    })

    return consistencyAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveConsistencyAdminActions(),
      guidance: getConsistencyAdminGuidance({ stats }),
    })
  }

  async executeConsistencyAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_consistency_summary'
    },
  ) {
    this.assertCanManageConsistency(authContext)

    const payload = consistencyAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_consistency_summary': {
        const summary = await this.getWorkspaceConsistencyAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return consistencyAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed consistency summary with ${summary.stats.consistencyPercent}% run consistency across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageConsistency(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production consistency tools.',
    })
  }
}
