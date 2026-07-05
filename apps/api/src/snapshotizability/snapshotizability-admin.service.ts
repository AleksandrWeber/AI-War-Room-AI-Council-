import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getSnapshotizabilityRolloutGuidance,
  snapshotizabilityAdminActionRequestSchema,
  snapshotizabilityAdminActionResponseSchema,
  snapshotizabilityAdminSummaryResponseSchema,
  snapshotizabilityCapabilitiesResponseSchema,
  snapshotizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildSnapshotizabilityAdminRecords,
  buildSnapshotizabilityAdminStats,
  getSnapshotizabilityAdminGuidance,
  resolveSnapshotizabilityAdminActions,
} from './snapshotizability-admin.helpers.js'
import { evaluateSnapshotizabilityRollout } from './snapshotizability-rollout.helpers.js'
import { SnapshotizabilityStatusService } from './snapshotizability-status.service.js'

@Injectable()
export class SnapshotizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly snapshotizabilityStatusService: SnapshotizabilityStatusService,
  ) {}

  getCapabilities() {
    return snapshotizabilityCapabilitiesResponseSchema.parse({
      supportsSnapshotizabilityRollout: true,
      supportsSnapshotizabilityAdminTools: true,
      supportsIdempotencyKeySnapshotizabilitySignals: true,
      supportsUsageEventSnapshotizabilitySignals: true,
      guidance: getSnapshotizabilityRolloutGuidance(),
    })
  }

  async getSnapshotizabilityRollout() {
    const snapshotizabilityTableCoverage =
      await this.snapshotizabilityStatusService.getSnapshotizabilityTableCoverage()

    const rollout = evaluateSnapshotizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.snapshotizabilityStatusService.pingPostgres(),
      existingSnapshotizabilityTableCount: snapshotizabilityTableCoverage.existingSnapshotizabilityTableCount,
      idempotencyKeysTableExists: snapshotizabilityTableCoverage.idempotencyKeysTableExists,
      usageEventsTableExists: snapshotizabilityTableCoverage.usageEventsTableExists,
      billingWebhookEventsTableExists: snapshotizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return snapshotizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceSnapshotizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageSnapshotizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.snapshotizabilityStatusService.getWorkspaceSnapshotizabilityInventory(
        workspaceId,
      )
    const records = buildSnapshotizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.snapshotizabilityStatusService.pingPostgres()
    const stats = buildSnapshotizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return snapshotizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveSnapshotizabilityAdminActions(),
      guidance: getSnapshotizabilityAdminGuidance({ stats }),
    })
  }

  async executeSnapshotizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_snapshotizability_summary'
    },
  ) {
    this.assertCanManageSnapshotizability(authContext)

    const payload = snapshotizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_snapshotizability_summary': {
        const summary = await this.getWorkspaceSnapshotizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return snapshotizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed snapshotizability summary with ${summary.stats.snapshotizabilityPercent}% idempotency key snapshotizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageSnapshotizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production snapshotizability tools.',
    })
  }
}
