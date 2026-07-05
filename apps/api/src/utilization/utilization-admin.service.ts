import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getUtilizationRolloutGuidance,
  utilizationAdminActionRequestSchema,
  utilizationAdminActionResponseSchema,
  utilizationAdminSummaryResponseSchema,
  utilizationCapabilitiesResponseSchema,
  utilizationRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildUtilizationAdminRecords,
  buildUtilizationAdminStats,
  getUtilizationAdminGuidance,
  resolveUtilizationAdminActions,
} from './utilization-admin.helpers.js'
import { evaluateUtilizationRollout } from './utilization-rollout.helpers.js'
import { UtilizationStatusService } from './utilization-status.service.js'

@Injectable()
export class UtilizationAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly utilizationStatusService: UtilizationStatusService,
  ) {}

  getCapabilities() {
    return utilizationCapabilitiesResponseSchema.parse({
      supportsUtilizationRollout: true,
      supportsUtilizationAdminTools: true,
      supportsUsageConsumptionUtilizationSignals: true,
      supportsMembershipUtilizationSignals: true,
      guidance: getUtilizationRolloutGuidance(),
    })
  }

  async getUtilizationRollout() {
    const utilizationTableCoverage =
      await this.utilizationStatusService.getUtilizationTableCoverage()

    const rollout = evaluateUtilizationRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity:
        await this.utilizationStatusService.pingPostgres(),
      existingUtilizationTableCount:
        utilizationTableCoverage.existingUtilizationTableCount,
      usageEventsTableExists: utilizationTableCoverage.usageEventsTableExists,
      workspaceMembershipsTableExists:
        utilizationTableCoverage.workspaceMembershipsTableExists,
      usageLimitsTableExists: utilizationTableCoverage.usageLimitsTableExists,
    })

    return utilizationRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceUtilizationAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageUtilization(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.utilizationStatusService.getWorkspaceUtilizationInventory(
        workspaceId,
      )
    const records = buildUtilizationAdminRecords(inventoryItems)
    const postgresConnectivity =
      await this.utilizationStatusService.pingPostgres()
    const stats = buildUtilizationAdminStats({
      records,
      postgresConnectivity,
    })

    return utilizationAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveUtilizationAdminActions(),
      guidance: getUtilizationAdminGuidance({ stats }),
    })
  }

  async executeUtilizationAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_utilization_summary'
    },
  ) {
    this.assertCanManageUtilization(authContext)

    const payload = utilizationAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_utilization_summary': {
        const summary = await this.getWorkspaceUtilizationAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return utilizationAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed utilization summary with ${summary.stats.utilizationPercent}% workspace utilization across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageUtilization(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production utilization tools.',
    })
  }
}
