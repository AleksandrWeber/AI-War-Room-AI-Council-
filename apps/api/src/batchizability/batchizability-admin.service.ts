import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getBatchizabilityRolloutGuidance,
  batchizabilityAdminActionRequestSchema,
  batchizabilityAdminActionResponseSchema,
  batchizabilityAdminSummaryResponseSchema,
  batchizabilityCapabilitiesResponseSchema,
  batchizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildBatchizabilityAdminRecords,
  buildBatchizabilityAdminStats,
  getBatchizabilityAdminGuidance,
  resolveBatchizabilityAdminActions,
} from './batchizability-admin.helpers.js'
import { evaluateBatchizabilityRollout } from './batchizability-rollout.helpers.js'
import { BatchizabilityStatusService } from './batchizability-status.service.js'

@Injectable()
export class BatchizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly batchizabilityStatusService: BatchizabilityStatusService,
  ) {}

  getCapabilities() {
    return batchizabilityCapabilitiesResponseSchema.parse({
      supportsBatchizabilityRollout: true,
      supportsBatchizabilityAdminTools: true,
      supportsIdempotencyKeyBatchizabilitySignals: true,
      supportsUsageEventBatchizabilitySignals: true,
      guidance: getBatchizabilityRolloutGuidance(),
    })
  }

  async getBatchizabilityRollout() {
    const batchizabilityTableCoverage =
      await this.batchizabilityStatusService.getBatchizabilityTableCoverage()

    const rollout = evaluateBatchizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.batchizabilityStatusService.pingPostgres(),
      existingBatchizabilityTableCount: batchizabilityTableCoverage.existingBatchizabilityTableCount,
      idempotencyKeysTableExists: batchizabilityTableCoverage.idempotencyKeysTableExists,
      usageEventsTableExists: batchizabilityTableCoverage.usageEventsTableExists,
      billingWebhookEventsTableExists: batchizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return batchizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceBatchizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageBatchizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.batchizabilityStatusService.getWorkspaceBatchizabilityInventory(
        workspaceId,
      )
    const records = buildBatchizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.batchizabilityStatusService.pingPostgres()
    const stats = buildBatchizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return batchizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveBatchizabilityAdminActions(),
      guidance: getBatchizabilityAdminGuidance({ stats }),
    })
  }

  async executeBatchizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_batchizability_summary'
    },
  ) {
    this.assertCanManageBatchizability(authContext)

    const payload = batchizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_batchizability_summary': {
        const summary = await this.getWorkspaceBatchizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return batchizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed batchizability summary with ${summary.stats.batchizabilityPercent}% idempotency key batchizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageBatchizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production batchizability tools.',
    })
  }
}
