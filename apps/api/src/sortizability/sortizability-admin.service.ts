import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getSortizabilityRolloutGuidance,
  sortizabilityAdminActionRequestSchema,
  sortizabilityAdminActionResponseSchema,
  sortizabilityAdminSummaryResponseSchema,
  sortizabilityCapabilitiesResponseSchema,
  sortizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildSortizabilityAdminRecords,
  buildSortizabilityAdminStats,
  getSortizabilityAdminGuidance,
  resolveSortizabilityAdminActions,
} from './sortizability-admin.helpers.js'
import { evaluateSortizabilityRollout } from './sortizability-rollout.helpers.js'
import { SortizabilityStatusService } from './sortizability-status.service.js'

@Injectable()
export class SortizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly sortizabilityStatusService: SortizabilityStatusService,
  ) {}

  getCapabilities() {
    return sortizabilityCapabilitiesResponseSchema.parse({
      supportsSortizabilityRollout: true,
      supportsSortizabilityAdminTools: true,
      supportsWorkspaceLimitSortizabilitySignals: true,
      supportsUsageEventSortizabilitySignals: true,
      guidance: getSortizabilityRolloutGuidance(),
    })
  }

  async getSortizabilityRollout() {
    const sortizabilityTableCoverage =
      await this.sortizabilityStatusService.getSortizabilityTableCoverage()

    const rollout = evaluateSortizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.sortizabilityStatusService.pingPostgres(),
      existingSortizabilityTableCount: sortizabilityTableCoverage.existingSortizabilityTableCount,
      workspaceUsageLimitsTableExists: sortizabilityTableCoverage.workspaceUsageLimitsTableExists,
      usageEventsTableExists: sortizabilityTableCoverage.usageEventsTableExists,
      billingRecordsTableExists: sortizabilityTableCoverage.billingRecordsTableExists,
    })

    return sortizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceSortizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageSortizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.sortizabilityStatusService.getWorkspaceSortizabilityInventory(
        workspaceId,
      )
    const records = buildSortizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.sortizabilityStatusService.pingPostgres()
    const stats = buildSortizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return sortizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveSortizabilityAdminActions(),
      guidance: getSortizabilityAdminGuidance({ stats }),
    })
  }

  async executeSortizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_sortizability_summary'
    },
  ) {
    this.assertCanManageSortizability(authContext)

    const payload = sortizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_sortizability_summary': {
        const summary = await this.getWorkspaceSortizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return sortizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed sortizability summary with ${summary.stats.sortizabilityPercent}% workspace limit sortizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageSortizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production sortizability tools.',
    })
  }
}
