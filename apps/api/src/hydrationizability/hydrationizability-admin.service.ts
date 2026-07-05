import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getHydrationizabilityRolloutGuidance,
  hydrationizabilityAdminActionRequestSchema,
  hydrationizabilityAdminActionResponseSchema,
  hydrationizabilityAdminSummaryResponseSchema,
  hydrationizabilityCapabilitiesResponseSchema,
  hydrationizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildHydrationizabilityAdminRecords,
  buildHydrationizabilityAdminStats,
  getHydrationizabilityAdminGuidance,
  resolveHydrationizabilityAdminActions,
} from './hydrationizability-admin.helpers.js'
import { evaluateHydrationizabilityRollout } from './hydrationizability-rollout.helpers.js'
import { HydrationizabilityStatusService } from './hydrationizability-status.service.js'

@Injectable()
export class HydrationizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly hydrationizabilityStatusService: HydrationizabilityStatusService,
  ) {}

  getCapabilities() {
    return hydrationizabilityCapabilitiesResponseSchema.parse({
      supportsHydrationizabilityRollout: true,
      supportsHydrationizabilityAdminTools: true,
      supportsShieldScanHydrationizabilitySignals: true,
      supportsProviderCredentialHydrationizabilitySignals: true,
      guidance: getHydrationizabilityRolloutGuidance(),
    })
  }

  async getHydrationizabilityRollout() {
    const hydrationizabilityTableCoverage =
      await this.hydrationizabilityStatusService.getHydrationizabilityTableCoverage()

    const rollout = evaluateHydrationizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.hydrationizabilityStatusService.pingPostgres(),
      existingHydrationizabilityTableCount: hydrationizabilityTableCoverage.existingHydrationizabilityTableCount,
      shieldScansTableExists: hydrationizabilityTableCoverage.shieldScansTableExists,
      workspaceProviderCredentialsTableExists: hydrationizabilityTableCoverage.workspaceProviderCredentialsTableExists,
      billingWebhookEventsTableExists: hydrationizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return hydrationizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceHydrationizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageHydrationizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.hydrationizabilityStatusService.getWorkspaceHydrationizabilityInventory(
        workspaceId,
      )
    const records = buildHydrationizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.hydrationizabilityStatusService.pingPostgres()
    const stats = buildHydrationizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return hydrationizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveHydrationizabilityAdminActions(),
      guidance: getHydrationizabilityAdminGuidance({ stats }),
    })
  }

  async executeHydrationizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_hydrationizability_summary'
    },
  ) {
    this.assertCanManageHydrationizability(authContext)

    const payload = hydrationizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_hydrationizability_summary': {
        const summary = await this.getWorkspaceHydrationizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return hydrationizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed hydrationizability summary with ${summary.stats.hydrationizabilityPercent}% shield scan hydrationizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageHydrationizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production hydrationizability tools.',
    })
  }
}
