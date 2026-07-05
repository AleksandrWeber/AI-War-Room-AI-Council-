import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getRoutizabilityRolloutGuidance,
  routizabilityAdminActionRequestSchema,
  routizabilityAdminActionResponseSchema,
  routizabilityAdminSummaryResponseSchema,
  routizabilityCapabilitiesResponseSchema,
  routizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildRoutizabilityAdminRecords,
  buildRoutizabilityAdminStats,
  getRoutizabilityAdminGuidance,
  resolveRoutizabilityAdminActions,
} from './routizability-admin.helpers.js'
import { evaluateRoutizabilityRollout } from './routizability-rollout.helpers.js'
import { RoutizabilityStatusService } from './routizability-status.service.js'

@Injectable()
export class RoutizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly routizabilityStatusService: RoutizabilityStatusService,
  ) {}

  getCapabilities() {
    return routizabilityCapabilitiesResponseSchema.parse({
      supportsRoutizabilityRollout: true,
      supportsRoutizabilityAdminTools: true,
      supportsShieldScanRoutizabilitySignals: true,
      supportsProviderCredentialRoutizabilitySignals: true,
      guidance: getRoutizabilityRolloutGuidance(),
    })
  }

  async getRoutizabilityRollout() {
    const routizabilityTableCoverage =
      await this.routizabilityStatusService.getRoutizabilityTableCoverage()

    const rollout = evaluateRoutizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.routizabilityStatusService.pingPostgres(),
      existingRoutizabilityTableCount: routizabilityTableCoverage.existingRoutizabilityTableCount,
      shieldScansTableExists: routizabilityTableCoverage.shieldScansTableExists,
      workspaceProviderCredentialsTableExists: routizabilityTableCoverage.workspaceProviderCredentialsTableExists,
      billingWebhookEventsTableExists: routizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return routizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceRoutizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageRoutizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.routizabilityStatusService.getWorkspaceRoutizabilityInventory(
        workspaceId,
      )
    const records = buildRoutizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.routizabilityStatusService.pingPostgres()
    const stats = buildRoutizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return routizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveRoutizabilityAdminActions(),
      guidance: getRoutizabilityAdminGuidance({ stats }),
    })
  }

  async executeRoutizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_routizability_summary'
    },
  ) {
    this.assertCanManageRoutizability(authContext)

    const payload = routizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_routizability_summary': {
        const summary = await this.getWorkspaceRoutizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return routizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed routizability summary with ${summary.stats.routizabilityPercent}% shield scan routizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageRoutizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production routizability tools.',
    })
  }
}
