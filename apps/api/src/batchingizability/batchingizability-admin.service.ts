import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getBatchingizabilityRolloutGuidance,
  batchingizabilityAdminActionRequestSchema,
  batchingizabilityAdminActionResponseSchema,
  batchingizabilityAdminSummaryResponseSchema,
  batchingizabilityCapabilitiesResponseSchema,
  batchingizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildBatchingizabilityAdminRecords,
  buildBatchingizabilityAdminStats,
  getBatchingizabilityAdminGuidance,
  resolveBatchingizabilityAdminActions,
} from './batchingizability-admin.helpers.js'
import { evaluateBatchingizabilityRollout } from './batchingizability-rollout.helpers.js'
import { BatchingizabilityStatusService } from './batchingizability-status.service.js'

@Injectable()
export class BatchingizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly batchingizabilityStatusService: BatchingizabilityStatusService,
  ) {}

  getCapabilities() {
    return batchingizabilityCapabilitiesResponseSchema.parse({
      supportsBatchingizabilityRollout: true,
      supportsBatchingizabilityAdminTools: true,
      supportsMembershipBatchingizabilitySignals: true,
      supportsUsageEventBatchingizabilitySignals: true,
      guidance: getBatchingizabilityRolloutGuidance(),
    })
  }

  async getBatchingizabilityRollout() {
    const batchingizabilityTableCoverage =
      await this.batchingizabilityStatusService.getBatchingizabilityTableCoverage()

    const rollout = evaluateBatchingizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.batchingizabilityStatusService.pingPostgres(),
      existingBatchingizabilityTableCount: batchingizabilityTableCoverage.existingBatchingizabilityTableCount,
      workspaceMembershipsTableExists: batchingizabilityTableCoverage.workspaceMembershipsTableExists,
      usageEventsTableExists: batchingizabilityTableCoverage.usageEventsTableExists,
      billingNotificationsTableExists: batchingizabilityTableCoverage.billingNotificationsTableExists,
    })

    return batchingizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceBatchingizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageBatchingizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.batchingizabilityStatusService.getWorkspaceBatchingizabilityInventory(
        workspaceId,
      )
    const records = buildBatchingizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.batchingizabilityStatusService.pingPostgres()
    const stats = buildBatchingizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return batchingizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveBatchingizabilityAdminActions(),
      guidance: getBatchingizabilityAdminGuidance({ stats }),
    })
  }

  async executeBatchingizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_batchingizability_summary'
    },
  ) {
    this.assertCanManageBatchingizability(authContext)

    const payload = batchingizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_batchingizability_summary': {
        const summary = await this.getWorkspaceBatchingizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return batchingizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed batchingizability summary with ${summary.stats.batchingizabilityPercent}% membership batchingizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageBatchingizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production batchingizability tools.',
    })
  }
}
