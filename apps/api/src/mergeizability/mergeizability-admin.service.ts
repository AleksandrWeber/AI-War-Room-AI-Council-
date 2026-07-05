import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getMergeizabilityRolloutGuidance,
  mergeizabilityAdminActionRequestSchema,
  mergeizabilityAdminActionResponseSchema,
  mergeizabilityAdminSummaryResponseSchema,
  mergeizabilityCapabilitiesResponseSchema,
  mergeizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildMergeizabilityAdminRecords,
  buildMergeizabilityAdminStats,
  getMergeizabilityAdminGuidance,
  resolveMergeizabilityAdminActions,
} from './mergeizability-admin.helpers.js'
import { evaluateMergeizabilityRollout } from './mergeizability-rollout.helpers.js'
import { MergeizabilityStatusService } from './mergeizability-status.service.js'

@Injectable()
export class MergeizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly mergeizabilityStatusService: MergeizabilityStatusService,
  ) {}

  getCapabilities() {
    return mergeizabilityCapabilitiesResponseSchema.parse({
      supportsMergeizabilityRollout: true,
      supportsMergeizabilityAdminTools: true,
      supportsMembershipMergeizabilitySignals: true,
      supportsUsageEventMergeizabilitySignals: true,
      guidance: getMergeizabilityRolloutGuidance(),
    })
  }

  async getMergeizabilityRollout() {
    const mergeizabilityTableCoverage =
      await this.mergeizabilityStatusService.getMergeizabilityTableCoverage()

    const rollout = evaluateMergeizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.mergeizabilityStatusService.pingPostgres(),
      existingMergeizabilityTableCount: mergeizabilityTableCoverage.existingMergeizabilityTableCount,
      workspaceMembershipsTableExists: mergeizabilityTableCoverage.workspaceMembershipsTableExists,
      usageEventsTableExists: mergeizabilityTableCoverage.usageEventsTableExists,
      billingNotificationsTableExists: mergeizabilityTableCoverage.billingNotificationsTableExists,
    })

    return mergeizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceMergeizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageMergeizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.mergeizabilityStatusService.getWorkspaceMergeizabilityInventory(
        workspaceId,
      )
    const records = buildMergeizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.mergeizabilityStatusService.pingPostgres()
    const stats = buildMergeizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return mergeizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveMergeizabilityAdminActions(),
      guidance: getMergeizabilityAdminGuidance({ stats }),
    })
  }

  async executeMergeizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_mergeizability_summary'
    },
  ) {
    this.assertCanManageMergeizability(authContext)

    const payload = mergeizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_mergeizability_summary': {
        const summary = await this.getWorkspaceMergeizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return mergeizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed mergeizability summary with ${summary.stats.mergeizabilityPercent}% membership mergeizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageMergeizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production mergeizability tools.',
    })
  }
}
