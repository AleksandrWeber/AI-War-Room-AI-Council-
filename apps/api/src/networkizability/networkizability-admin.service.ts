import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getNetworkizabilityRolloutGuidance,
  networkizabilityAdminActionRequestSchema,
  networkizabilityAdminActionResponseSchema,
  networkizabilityAdminSummaryResponseSchema,
  networkizabilityCapabilitiesResponseSchema,
  networkizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildNetworkizabilityAdminRecords,
  buildNetworkizabilityAdminStats,
  getNetworkizabilityAdminGuidance,
  resolveNetworkizabilityAdminActions,
} from './networkizability-admin.helpers.js'
import { evaluateNetworkizabilityRollout } from './networkizability-rollout.helpers.js'
import { NetworkizabilityStatusService } from './networkizability-status.service.js'

@Injectable()
export class NetworkizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly networkizabilityStatusService: NetworkizabilityStatusService,
  ) {}

  getCapabilities() {
    return networkizabilityCapabilitiesResponseSchema.parse({
      supportsNetworkizabilityRollout: true,
      supportsNetworkizabilityAdminTools: true,
      supportsMeterUsageNetworkizabilitySignals: true,
      supportsUsageEventNetworkizabilitySignals: true,
      guidance: getNetworkizabilityRolloutGuidance(),
    })
  }

  async getNetworkizabilityRollout() {
    const networkizabilityTableCoverage =
      await this.networkizabilityStatusService.getNetworkizabilityTableCoverage()

    const rollout = evaluateNetworkizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.networkizabilityStatusService.pingPostgres(),
      existingNetworkizabilityTableCount: networkizabilityTableCoverage.existingNetworkizabilityTableCount,
      billingMeterUsageReportsTableExists: networkizabilityTableCoverage.billingMeterUsageReportsTableExists,
      usageEventsTableExists: networkizabilityTableCoverage.usageEventsTableExists,
      workspaceUsageLimitsTableExists: networkizabilityTableCoverage.workspaceUsageLimitsTableExists,
    })

    return networkizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceNetworkizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageNetworkizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.networkizabilityStatusService.getWorkspaceNetworkizabilityInventory(
        workspaceId,
      )
    const records = buildNetworkizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.networkizabilityStatusService.pingPostgres()
    const stats = buildNetworkizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return networkizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveNetworkizabilityAdminActions(),
      guidance: getNetworkizabilityAdminGuidance({ stats }),
    })
  }

  async executeNetworkizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_networkizability_summary'
    },
  ) {
    this.assertCanManageNetworkizability(authContext)

    const payload = networkizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_networkizability_summary': {
        const summary = await this.getWorkspaceNetworkizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return networkizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed networkizability summary with ${summary.stats.networkizabilityPercent}% meter usage networkizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageNetworkizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production networkizability tools.',
    })
  }
}
