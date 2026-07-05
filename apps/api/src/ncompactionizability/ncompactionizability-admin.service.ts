import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getNcompactionizabilityRolloutGuidance,
  ncompactionizabilityAdminActionRequestSchema,
  ncompactionizabilityAdminActionResponseSchema,
  ncompactionizabilityAdminSummaryResponseSchema,
  ncompactionizabilityCapabilitiesResponseSchema,
  ncompactionizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildNcompactionizabilityAdminRecords,
  buildNcompactionizabilityAdminStats,
  getNcompactionizabilityAdminGuidance,
  resolveNcompactionizabilityAdminActions,
} from './ncompactionizability-admin.helpers.js'
import { evaluateNcompactionizabilityRollout } from './ncompactionizability-rollout.helpers.js'
import { NcompactionizabilityStatusService } from './ncompactionizability-status.service.js'

@Injectable()
export class NcompactionizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly ncompactionizabilityStatusService: NcompactionizabilityStatusService,
  ) {}

  getCapabilities() {
    return ncompactionizabilityCapabilitiesResponseSchema.parse({
      supportsNcompactionizabilityRollout: true,
      supportsNcompactionizabilityAdminTools: true,
      supportsMeterUsageNcompactionizabilitySignals: true,
      supportsUsageEventNcompactionizabilitySignals: true,
      guidance: getNcompactionizabilityRolloutGuidance(),
    })
  }

  async getNcompactionizabilityRollout() {
    const ncompactionizabilityTableCoverage =
      await this.ncompactionizabilityStatusService.getNcompactionizabilityTableCoverage()

    const rollout = evaluateNcompactionizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.ncompactionizabilityStatusService.pingPostgres(),
      existingNcompactionizabilityTableCount: ncompactionizabilityTableCoverage.existingNcompactionizabilityTableCount,
      billingMeterUsageReportsTableExists: ncompactionizabilityTableCoverage.billingMeterUsageReportsTableExists,
      usageEventsTableExists: ncompactionizabilityTableCoverage.usageEventsTableExists,
      workspaceUsageLimitsTableExists: ncompactionizabilityTableCoverage.workspaceUsageLimitsTableExists,
    })

    return ncompactionizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceNcompactionizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageNcompactionizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.ncompactionizabilityStatusService.getWorkspaceNcompactionizabilityInventory(
        workspaceId,
      )
    const records = buildNcompactionizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.ncompactionizabilityStatusService.pingPostgres()
    const stats = buildNcompactionizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return ncompactionizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveNcompactionizabilityAdminActions(),
      guidance: getNcompactionizabilityAdminGuidance({ stats }),
    })
  }

  async executeNcompactionizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_ncompactionizability_summary'
    },
  ) {
    this.assertCanManageNcompactionizability(authContext)

    const payload = ncompactionizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_ncompactionizability_summary': {
        const summary = await this.getWorkspaceNcompactionizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return ncompactionizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed ncompactionizability summary with ${summary.stats.ncompactionizabilityPercent}% meter usage ncompactionizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageNcompactionizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production ncompactionizability tools.',
    })
  }
}
