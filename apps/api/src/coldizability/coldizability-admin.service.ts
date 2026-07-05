import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getColdizabilityRolloutGuidance,
  coldizabilityAdminActionRequestSchema,
  coldizabilityAdminActionResponseSchema,
  coldizabilityAdminSummaryResponseSchema,
  coldizabilityCapabilitiesResponseSchema,
  coldizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildColdizabilityAdminRecords,
  buildColdizabilityAdminStats,
  getColdizabilityAdminGuidance,
  resolveColdizabilityAdminActions,
} from './coldizability-admin.helpers.js'
import { evaluateColdizabilityRollout } from './coldizability-rollout.helpers.js'
import { ColdizabilityStatusService } from './coldizability-status.service.js'

@Injectable()
export class ColdizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly coldizabilityStatusService: ColdizabilityStatusService,
  ) {}

  getCapabilities() {
    return coldizabilityCapabilitiesResponseSchema.parse({
      supportsColdizabilityRollout: true,
      supportsColdizabilityAdminTools: true,
      supportsWorkspaceLimitColdizabilitySignals: true,
      supportsUsageEventColdizabilitySignals: true,
      guidance: getColdizabilityRolloutGuidance(),
    })
  }

  async getColdizabilityRollout() {
    const coldizabilityTableCoverage =
      await this.coldizabilityStatusService.getColdizabilityTableCoverage()

    const rollout = evaluateColdizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.coldizabilityStatusService.pingPostgres(),
      existingColdizabilityTableCount: coldizabilityTableCoverage.existingColdizabilityTableCount,
      workspaceUsageLimitsTableExists: coldizabilityTableCoverage.workspaceUsageLimitsTableExists,
      usageEventsTableExists: coldizabilityTableCoverage.usageEventsTableExists,
      billingRecordsTableExists: coldizabilityTableCoverage.billingRecordsTableExists,
    })

    return coldizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceColdizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageColdizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.coldizabilityStatusService.getWorkspaceColdizabilityInventory(
        workspaceId,
      )
    const records = buildColdizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.coldizabilityStatusService.pingPostgres()
    const stats = buildColdizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return coldizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveColdizabilityAdminActions(),
      guidance: getColdizabilityAdminGuidance({ stats }),
    })
  }

  async executeColdizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_coldizability_summary'
    },
  ) {
    this.assertCanManageColdizability(authContext)

    const payload = coldizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_coldizability_summary': {
        const summary = await this.getWorkspaceColdizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return coldizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed coldizability summary with ${summary.stats.coldizabilityPercent}% workspace limit coldizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageColdizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production coldizability tools.',
    })
  }
}
