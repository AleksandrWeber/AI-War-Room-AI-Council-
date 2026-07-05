import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getPartitioningizabilityRolloutGuidance,
  partitioningizabilityAdminActionRequestSchema,
  partitioningizabilityAdminActionResponseSchema,
  partitioningizabilityAdminSummaryResponseSchema,
  partitioningizabilityCapabilitiesResponseSchema,
  partitioningizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildPartitioningizabilityAdminRecords,
  buildPartitioningizabilityAdminStats,
  getPartitioningizabilityAdminGuidance,
  resolvePartitioningizabilityAdminActions,
} from './partitioningizability-admin.helpers.js'
import { evaluatePartitioningizabilityRollout } from './partitioningizability-rollout.helpers.js'
import { PartitioningizabilityStatusService } from './partitioningizability-status.service.js'

@Injectable()
export class PartitioningizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly partitioningizabilityStatusService: PartitioningizabilityStatusService,
  ) {}

  getCapabilities() {
    return partitioningizabilityCapabilitiesResponseSchema.parse({
      supportsPartitioningizabilityRollout: true,
      supportsPartitioningizabilityAdminTools: true,
      supportsMembershipPartitioningizabilitySignals: true,
      supportsUsageEventPartitioningizabilitySignals: true,
      guidance: getPartitioningizabilityRolloutGuidance(),
    })
  }

  async getPartitioningizabilityRollout() {
    const partitioningizabilityTableCoverage =
      await this.partitioningizabilityStatusService.getPartitioningizabilityTableCoverage()

    const rollout = evaluatePartitioningizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.partitioningizabilityStatusService.pingPostgres(),
      existingPartitioningizabilityTableCount: partitioningizabilityTableCoverage.existingPartitioningizabilityTableCount,
      workspaceMembershipsTableExists: partitioningizabilityTableCoverage.workspaceMembershipsTableExists,
      usageEventsTableExists: partitioningizabilityTableCoverage.usageEventsTableExists,
      billingNotificationsTableExists: partitioningizabilityTableCoverage.billingNotificationsTableExists,
    })

    return partitioningizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspacePartitioningizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManagePartitioningizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.partitioningizabilityStatusService.getWorkspacePartitioningizabilityInventory(
        workspaceId,
      )
    const records = buildPartitioningizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.partitioningizabilityStatusService.pingPostgres()
    const stats = buildPartitioningizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return partitioningizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolvePartitioningizabilityAdminActions(),
      guidance: getPartitioningizabilityAdminGuidance({ stats }),
    })
  }

  async executePartitioningizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_partitioningizability_summary'
    },
  ) {
    this.assertCanManagePartitioningizability(authContext)

    const payload = partitioningizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_partitioningizability_summary': {
        const summary = await this.getWorkspacePartitioningizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return partitioningizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed partitioningizability summary with ${summary.stats.partitioningizabilityPercent}% membership partitioningizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManagePartitioningizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production partitioningizability tools.',
    })
  }
}
