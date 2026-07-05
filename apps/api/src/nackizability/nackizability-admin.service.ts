import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getNackizabilityRolloutGuidance,
  nackizabilityAdminActionRequestSchema,
  nackizabilityAdminActionResponseSchema,
  nackizabilityAdminSummaryResponseSchema,
  nackizabilityCapabilitiesResponseSchema,
  nackizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildNackizabilityAdminRecords,
  buildNackizabilityAdminStats,
  getNackizabilityAdminGuidance,
  resolveNackizabilityAdminActions,
} from './nackizability-admin.helpers.js'
import { evaluateNackizabilityRollout } from './nackizability-rollout.helpers.js'
import { NackizabilityStatusService } from './nackizability-status.service.js'

@Injectable()
export class NackizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly nackizabilityStatusService: NackizabilityStatusService,
  ) {}

  getCapabilities() {
    return nackizabilityCapabilitiesResponseSchema.parse({
      supportsNackizabilityRollout: true,
      supportsNackizabilityAdminTools: true,
      supportsMeterUsageNackizabilitySignals: true,
      supportsUsageEventNackizabilitySignals: true,
      guidance: getNackizabilityRolloutGuidance(),
    })
  }

  async getNackizabilityRollout() {
    const nackizabilityTableCoverage =
      await this.nackizabilityStatusService.getNackizabilityTableCoverage()

    const rollout = evaluateNackizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.nackizabilityStatusService.pingPostgres(),
      existingNackizabilityTableCount: nackizabilityTableCoverage.existingNackizabilityTableCount,
      billingMeterUsageReportsTableExists: nackizabilityTableCoverage.billingMeterUsageReportsTableExists,
      usageEventsTableExists: nackizabilityTableCoverage.usageEventsTableExists,
      workspaceUsageLimitsTableExists: nackizabilityTableCoverage.workspaceUsageLimitsTableExists,
    })

    return nackizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceNackizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageNackizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.nackizabilityStatusService.getWorkspaceNackizabilityInventory(
        workspaceId,
      )
    const records = buildNackizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.nackizabilityStatusService.pingPostgres()
    const stats = buildNackizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return nackizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveNackizabilityAdminActions(),
      guidance: getNackizabilityAdminGuidance({ stats }),
    })
  }

  async executeNackizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_nackizability_summary'
    },
  ) {
    this.assertCanManageNackizability(authContext)

    const payload = nackizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_nackizability_summary': {
        const summary = await this.getWorkspaceNackizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return nackizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed nackizability summary with ${summary.stats.nackizabilityPercent}% meter usage nackizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageNackizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production nackizability tools.',
    })
  }
}
