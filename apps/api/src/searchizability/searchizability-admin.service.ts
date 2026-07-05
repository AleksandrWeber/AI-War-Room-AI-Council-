import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getSearchizabilityRolloutGuidance,
  searchizabilityAdminActionRequestSchema,
  searchizabilityAdminActionResponseSchema,
  searchizabilityAdminSummaryResponseSchema,
  searchizabilityCapabilitiesResponseSchema,
  searchizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildSearchizabilityAdminRecords,
  buildSearchizabilityAdminStats,
  getSearchizabilityAdminGuidance,
  resolveSearchizabilityAdminActions,
} from './searchizability-admin.helpers.js'
import { evaluateSearchizabilityRollout } from './searchizability-rollout.helpers.js'
import { SearchizabilityStatusService } from './searchizability-status.service.js'

@Injectable()
export class SearchizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly searchizabilityStatusService: SearchizabilityStatusService,
  ) {}

  getCapabilities() {
    return searchizabilityCapabilitiesResponseSchema.parse({
      supportsSearchizabilityRollout: true,
      supportsSearchizabilityAdminTools: true,
      supportsShieldScanSearchizabilitySignals: true,
      supportsProviderCredentialSearchizabilitySignals: true,
      guidance: getSearchizabilityRolloutGuidance(),
    })
  }

  async getSearchizabilityRollout() {
    const searchizabilityTableCoverage =
      await this.searchizabilityStatusService.getSearchizabilityTableCoverage()

    const rollout = evaluateSearchizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.searchizabilityStatusService.pingPostgres(),
      existingSearchizabilityTableCount: searchizabilityTableCoverage.existingSearchizabilityTableCount,
      shieldScansTableExists: searchizabilityTableCoverage.shieldScansTableExists,
      workspaceProviderCredentialsTableExists: searchizabilityTableCoverage.workspaceProviderCredentialsTableExists,
      billingWebhookEventsTableExists: searchizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return searchizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceSearchizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageSearchizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.searchizabilityStatusService.getWorkspaceSearchizabilityInventory(
        workspaceId,
      )
    const records = buildSearchizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.searchizabilityStatusService.pingPostgres()
    const stats = buildSearchizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return searchizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveSearchizabilityAdminActions(),
      guidance: getSearchizabilityAdminGuidance({ stats }),
    })
  }

  async executeSearchizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_searchizability_summary'
    },
  ) {
    this.assertCanManageSearchizability(authContext)

    const payload = searchizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_searchizability_summary': {
        const summary = await this.getWorkspaceSearchizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return searchizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed searchizability summary with ${summary.stats.searchizabilityPercent}% shield scan searchizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageSearchizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production searchizability tools.',
    })
  }
}
