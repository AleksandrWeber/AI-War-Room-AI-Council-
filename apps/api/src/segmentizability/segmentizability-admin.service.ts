import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getSegmentizabilityRolloutGuidance,
  segmentizabilityAdminActionRequestSchema,
  segmentizabilityAdminActionResponseSchema,
  segmentizabilityAdminSummaryResponseSchema,
  segmentizabilityCapabilitiesResponseSchema,
  segmentizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildSegmentizabilityAdminRecords,
  buildSegmentizabilityAdminStats,
  getSegmentizabilityAdminGuidance,
  resolveSegmentizabilityAdminActions,
} from './segmentizability-admin.helpers.js'
import { evaluateSegmentizabilityRollout } from './segmentizability-rollout.helpers.js'
import { SegmentizabilityStatusService } from './segmentizability-status.service.js'

@Injectable()
export class SegmentizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly segmentizabilityStatusService: SegmentizabilityStatusService,
  ) {}

  getCapabilities() {
    return segmentizabilityCapabilitiesResponseSchema.parse({
      supportsSegmentizabilityRollout: true,
      supportsSegmentizabilityAdminTools: true,
      supportsWorkspaceLimitSegmentizabilitySignals: true,
      supportsUsageEventSegmentizabilitySignals: true,
      guidance: getSegmentizabilityRolloutGuidance(),
    })
  }

  async getSegmentizabilityRollout() {
    const segmentizabilityTableCoverage =
      await this.segmentizabilityStatusService.getSegmentizabilityTableCoverage()

    const rollout = evaluateSegmentizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.segmentizabilityStatusService.pingPostgres(),
      existingSegmentizabilityTableCount: segmentizabilityTableCoverage.existingSegmentizabilityTableCount,
      workspaceUsageLimitsTableExists: segmentizabilityTableCoverage.workspaceUsageLimitsTableExists,
      usageEventsTableExists: segmentizabilityTableCoverage.usageEventsTableExists,
      billingRecordsTableExists: segmentizabilityTableCoverage.billingRecordsTableExists,
    })

    return segmentizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceSegmentizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageSegmentizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.segmentizabilityStatusService.getWorkspaceSegmentizabilityInventory(
        workspaceId,
      )
    const records = buildSegmentizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.segmentizabilityStatusService.pingPostgres()
    const stats = buildSegmentizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return segmentizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveSegmentizabilityAdminActions(),
      guidance: getSegmentizabilityAdminGuidance({ stats }),
    })
  }

  async executeSegmentizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_segmentizability_summary'
    },
  ) {
    this.assertCanManageSegmentizability(authContext)

    const payload = segmentizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_segmentizability_summary': {
        const summary = await this.getWorkspaceSegmentizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return segmentizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed segmentizability summary with ${summary.stats.segmentizabilityPercent}% workspace limit segmentizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageSegmentizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production segmentizability tools.',
    })
  }
}
