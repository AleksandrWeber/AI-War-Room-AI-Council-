import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getReplicabilizabilityRolloutGuidance,
  replicabilizabilityAdminActionRequestSchema,
  replicabilizabilityAdminActionResponseSchema,
  replicabilizabilityAdminSummaryResponseSchema,
  replicabilizabilityCapabilitiesResponseSchema,
  replicabilizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildReplicabilizabilityAdminRecords,
  buildReplicabilizabilityAdminStats,
  getReplicabilizabilityAdminGuidance,
  resolveReplicabilizabilityAdminActions,
} from './replicabilizability-admin.helpers.js'
import { evaluateReplicabilizabilityRollout } from './replicabilizability-rollout.helpers.js'
import { ReplicabilizabilityStatusService } from './replicabilizability-status.service.js'

@Injectable()
export class ReplicabilizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly replicabilizabilityStatusService: ReplicabilizabilityStatusService,
  ) {}

  getCapabilities() {
    return replicabilizabilityCapabilitiesResponseSchema.parse({
      supportsReplicabilizabilityRollout: true,
      supportsReplicabilizabilityAdminTools: true,
      supportsMeterUsageReplicabilizabilitySignals: true,
      supportsUsageEventReplicabilizabilitySignals: true,
      guidance: getReplicabilizabilityRolloutGuidance(),
    })
  }

  async getReplicabilizabilityRollout() {
    const replicabilizabilityTableCoverage =
      await this.replicabilizabilityStatusService.getReplicabilizabilityTableCoverage()

    const rollout = evaluateReplicabilizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.replicabilizabilityStatusService.pingPostgres(),
      existingReplicabilizabilityTableCount: replicabilizabilityTableCoverage.existingReplicabilizabilityTableCount,
      billingMeterUsageReportsTableExists: replicabilizabilityTableCoverage.billingMeterUsageReportsTableExists,
      usageEventsTableExists: replicabilizabilityTableCoverage.usageEventsTableExists,
      workspaceUsageLimitsTableExists: replicabilizabilityTableCoverage.workspaceUsageLimitsTableExists,
    })

    return replicabilizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceReplicabilizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageReplicabilizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.replicabilizabilityStatusService.getWorkspaceReplicabilizabilityInventory(
        workspaceId,
      )
    const records = buildReplicabilizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.replicabilizabilityStatusService.pingPostgres()
    const stats = buildReplicabilizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return replicabilizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveReplicabilizabilityAdminActions(),
      guidance: getReplicabilizabilityAdminGuidance({ stats }),
    })
  }

  async executeReplicabilizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_replicabilizability_summary'
    },
  ) {
    this.assertCanManageReplicabilizability(authContext)

    const payload = replicabilizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_replicabilizability_summary': {
        const summary = await this.getWorkspaceReplicabilizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return replicabilizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed replicabilizability summary with ${summary.stats.replicabilizabilityPercent}% meter usage replicabilizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageReplicabilizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production replicabilizability tools.',
    })
  }
}
