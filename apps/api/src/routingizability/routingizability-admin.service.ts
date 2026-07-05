import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getRoutingizabilityRolloutGuidance,
  routingizabilityAdminActionRequestSchema,
  routingizabilityAdminActionResponseSchema,
  routingizabilityAdminSummaryResponseSchema,
  routingizabilityCapabilitiesResponseSchema,
  routingizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildRoutingizabilityAdminRecords,
  buildRoutingizabilityAdminStats,
  getRoutingizabilityAdminGuidance,
  resolveRoutingizabilityAdminActions,
} from './routingizability-admin.helpers.js'
import { evaluateRoutingizabilityRollout } from './routingizability-rollout.helpers.js'
import { RoutingizabilityStatusService } from './routingizability-status.service.js'

@Injectable()
export class RoutingizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly routingizabilityStatusService: RoutingizabilityStatusService,
  ) {}

  getCapabilities() {
    return routingizabilityCapabilitiesResponseSchema.parse({
      supportsRoutingizabilityRollout: true,
      supportsRoutingizabilityAdminTools: true,
      supportsProviderCredentialRoutingizabilitySignals: true,
      supportsModelRegistryRoutingizabilitySignals: true,
      guidance: getRoutingizabilityRolloutGuidance(),
    })
  }

  async getRoutingizabilityRollout() {
    const routingizabilityTableCoverage =
      await this.routingizabilityStatusService.getRoutingizabilityTableCoverage()

    const rollout = evaluateRoutingizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.routingizabilityStatusService.pingPostgres(),
      existingRoutingizabilityTableCount: routingizabilityTableCoverage.existingRoutingizabilityTableCount,
      workspaceProviderCredentialsTableExists: routingizabilityTableCoverage.workspaceProviderCredentialsTableExists,
      modelRegistryEntriesTableExists: routingizabilityTableCoverage.modelRegistryEntriesTableExists,
      billingWebhookEventsTableExists: routingizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return routingizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceRoutingizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageRoutingizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.routingizabilityStatusService.getWorkspaceRoutingizabilityInventory(
        workspaceId,
      )
    const records = buildRoutingizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.routingizabilityStatusService.pingPostgres()
    const stats = buildRoutingizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return routingizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveRoutingizabilityAdminActions(),
      guidance: getRoutingizabilityAdminGuidance({ stats }),
    })
  }

  async executeRoutingizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_routingizability_summary'
    },
  ) {
    this.assertCanManageRoutingizability(authContext)

    const payload = routingizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_routingizability_summary': {
        const summary = await this.getWorkspaceRoutingizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return routingizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed routingizability summary with ${summary.stats.routingizabilityPercent}% provider credential routingizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageRoutingizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production routingizability tools.',
    })
  }
}
