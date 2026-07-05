import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getFilterizabilityRolloutGuidance,
  filterizabilityAdminActionRequestSchema,
  filterizabilityAdminActionResponseSchema,
  filterizabilityAdminSummaryResponseSchema,
  filterizabilityCapabilitiesResponseSchema,
  filterizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildFilterizabilityAdminRecords,
  buildFilterizabilityAdminStats,
  getFilterizabilityAdminGuidance,
  resolveFilterizabilityAdminActions,
} from './filterizability-admin.helpers.js'
import { evaluateFilterizabilityRollout } from './filterizability-rollout.helpers.js'
import { FilterizabilityStatusService } from './filterizability-status.service.js'

@Injectable()
export class FilterizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly filterizabilityStatusService: FilterizabilityStatusService,
  ) {}

  getCapabilities() {
    return filterizabilityCapabilitiesResponseSchema.parse({
      supportsFilterizabilityRollout: true,
      supportsFilterizabilityAdminTools: true,
      supportsMeterUsageFilterizabilitySignals: true,
      supportsUsageEventFilterizabilitySignals: true,
      guidance: getFilterizabilityRolloutGuidance(),
    })
  }

  async getFilterizabilityRollout() {
    const filterizabilityTableCoverage =
      await this.filterizabilityStatusService.getFilterizabilityTableCoverage()

    const rollout = evaluateFilterizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.filterizabilityStatusService.pingPostgres(),
      existingFilterizabilityTableCount: filterizabilityTableCoverage.existingFilterizabilityTableCount,
      billingMeterUsageReportsTableExists: filterizabilityTableCoverage.billingMeterUsageReportsTableExists,
      usageEventsTableExists: filterizabilityTableCoverage.usageEventsTableExists,
      workspaceUsageLimitsTableExists: filterizabilityTableCoverage.workspaceUsageLimitsTableExists,
    })

    return filterizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceFilterizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageFilterizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.filterizabilityStatusService.getWorkspaceFilterizabilityInventory(
        workspaceId,
      )
    const records = buildFilterizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.filterizabilityStatusService.pingPostgres()
    const stats = buildFilterizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return filterizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveFilterizabilityAdminActions(),
      guidance: getFilterizabilityAdminGuidance({ stats }),
    })
  }

  async executeFilterizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_filterizability_summary'
    },
  ) {
    this.assertCanManageFilterizability(authContext)

    const payload = filterizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_filterizability_summary': {
        const summary = await this.getWorkspaceFilterizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return filterizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed filterizability summary with ${summary.stats.filterizabilityPercent}% meter usage filterizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageFilterizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production filterizability tools.',
    })
  }
}
