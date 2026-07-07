import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getDiscoveryizabilityRolloutGuidance,
  discoveryizabilityAdminActionRequestSchema,
  discoveryizabilityAdminActionResponseSchema,
  discoveryizabilityAdminSummaryResponseSchema,
  discoveryizabilityCapabilitiesResponseSchema,
  discoveryizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildDiscoveryizabilityAdminRecords,
  buildDiscoveryizabilityAdminStats,
  getDiscoveryizabilityAdminGuidance,
  resolveDiscoveryizabilityAdminActions,
} from './discoveryizability-admin.helpers.js'
import { evaluateDiscoveryizabilityRollout } from './discoveryizability-rollout.helpers.js'
import { DiscoveryizabilityStatusService } from './discoveryizability-status.service.js'

@Injectable()
export class DiscoveryizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly discoveryizabilityStatusService: DiscoveryizabilityStatusService,
  ) {}

  getCapabilities() {
    return discoveryizabilityCapabilitiesResponseSchema.parse({
      supportsDiscoveryizabilityRollout: true,
      supportsDiscoveryizabilityAdminTools: true,
      supportsBillingWebhookDiscoveryizabilitySignals: true,
      supportsBillingRecordDiscoveryizabilitySignals: true,
      guidance: getDiscoveryizabilityRolloutGuidance(),
    })
  }

  async getDiscoveryizabilityRollout() {
    const discoveryizabilityTableCoverage =
      await this.discoveryizabilityStatusService.getDiscoveryizabilityTableCoverage()

    const rollout = evaluateDiscoveryizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.discoveryizabilityStatusService.pingPostgres(),
      existingDiscoveryizabilityTableCount: discoveryizabilityTableCoverage.existingDiscoveryizabilityTableCount,
      billingWebhookEventsTableExists: discoveryizabilityTableCoverage.billingWebhookEventsTableExists,
      billingRecordsTableExists: discoveryizabilityTableCoverage.billingRecordsTableExists,
      usageEventsTableExists: discoveryizabilityTableCoverage.usageEventsTableExists,
    })

    return discoveryizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceDiscoveryizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageDiscoveryizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.discoveryizabilityStatusService.getWorkspaceDiscoveryizabilityInventory(
        workspaceId,
      )
    const records = buildDiscoveryizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.discoveryizabilityStatusService.pingPostgres()
    const stats = buildDiscoveryizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return discoveryizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveDiscoveryizabilityAdminActions(),
      guidance: getDiscoveryizabilityAdminGuidance({ stats }),
    })
  }

  async executeDiscoveryizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_discoveryizability_summary'
    },
  ) {
    this.assertCanManageDiscoveryizability(authContext)

    const payload = discoveryizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_discoveryizability_summary': {
        const summary = await this.getWorkspaceDiscoveryizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return discoveryizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed discoveryizability summary with ${summary.stats.discoveryizabilityPercent}% billing webhook discoveryizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageDiscoveryizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production discoveryizability tools.',
    })
  }
}
