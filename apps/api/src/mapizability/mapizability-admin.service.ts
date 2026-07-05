import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getMapizabilityRolloutGuidance,
  mapizabilityAdminActionRequestSchema,
  mapizabilityAdminActionResponseSchema,
  mapizabilityAdminSummaryResponseSchema,
  mapizabilityCapabilitiesResponseSchema,
  mapizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildMapizabilityAdminRecords,
  buildMapizabilityAdminStats,
  getMapizabilityAdminGuidance,
  resolveMapizabilityAdminActions,
} from './mapizability-admin.helpers.js'
import { evaluateMapizabilityRollout } from './mapizability-rollout.helpers.js'
import { MapizabilityStatusService } from './mapizability-status.service.js'

@Injectable()
export class MapizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly mapizabilityStatusService: MapizabilityStatusService,
  ) {}

  getCapabilities() {
    return mapizabilityCapabilitiesResponseSchema.parse({
      supportsMapizabilityRollout: true,
      supportsMapizabilityAdminTools: true,
      supportsMeterUsageMapizabilitySignals: true,
      supportsUsageEventMapizabilitySignals: true,
      guidance: getMapizabilityRolloutGuidance(),
    })
  }

  async getMapizabilityRollout() {
    const mapizabilityTableCoverage =
      await this.mapizabilityStatusService.getMapizabilityTableCoverage()

    const rollout = evaluateMapizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.mapizabilityStatusService.pingPostgres(),
      existingMapizabilityTableCount: mapizabilityTableCoverage.existingMapizabilityTableCount,
      billingMeterUsageReportsTableExists: mapizabilityTableCoverage.billingMeterUsageReportsTableExists,
      usageEventsTableExists: mapizabilityTableCoverage.usageEventsTableExists,
      workspaceUsageLimitsTableExists: mapizabilityTableCoverage.workspaceUsageLimitsTableExists,
    })

    return mapizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceMapizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageMapizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.mapizabilityStatusService.getWorkspaceMapizabilityInventory(
        workspaceId,
      )
    const records = buildMapizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.mapizabilityStatusService.pingPostgres()
    const stats = buildMapizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return mapizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveMapizabilityAdminActions(),
      guidance: getMapizabilityAdminGuidance({ stats }),
    })
  }

  async executeMapizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_mapizability_summary'
    },
  ) {
    this.assertCanManageMapizability(authContext)

    const payload = mapizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_mapizability_summary': {
        const summary = await this.getWorkspaceMapizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return mapizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed mapizability summary with ${summary.stats.mapizabilityPercent}% meter usage mapizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageMapizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production mapizability tools.',
    })
  }
}
