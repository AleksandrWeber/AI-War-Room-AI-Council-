import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getHarmonizabilityRolloutGuidance,
  harmonizabilityAdminActionRequestSchema,
  harmonizabilityAdminActionResponseSchema,
  harmonizabilityAdminSummaryResponseSchema,
  harmonizabilityCapabilitiesResponseSchema,
  harmonizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildHarmonizabilityAdminRecords,
  buildHarmonizabilityAdminStats,
  getHarmonizabilityAdminGuidance,
  resolveHarmonizabilityAdminActions,
} from './harmonizability-admin.helpers.js'
import { evaluateHarmonizabilityRollout } from './harmonizability-rollout.helpers.js'
import { HarmonizabilityStatusService } from './harmonizability-status.service.js'

@Injectable()
export class HarmonizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly harmonizabilityStatusService: HarmonizabilityStatusService,
  ) {}

  getCapabilities() {
    return harmonizabilityCapabilitiesResponseSchema.parse({
      supportsHarmonizabilityRollout: true,
      supportsHarmonizabilityAdminTools: true,
      supportsMeterUsageHarmonizabilitySignals: true,
      supportsUsageEventHarmonizabilitySignals: true,
      guidance: getHarmonizabilityRolloutGuidance(),
    })
  }

  async getHarmonizabilityRollout() {
    const harmonizabilityTableCoverage =
      await this.harmonizabilityStatusService.getHarmonizabilityTableCoverage()

    const rollout = evaluateHarmonizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.harmonizabilityStatusService.pingPostgres(),
      existingHarmonizabilityTableCount: harmonizabilityTableCoverage.existingHarmonizabilityTableCount,
      billingMeterUsageReportsTableExists: harmonizabilityTableCoverage.billingMeterUsageReportsTableExists,
      usageEventsTableExists: harmonizabilityTableCoverage.usageEventsTableExists,
      workspaceUsageLimitsTableExists: harmonizabilityTableCoverage.workspaceUsageLimitsTableExists,
    })

    return harmonizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceHarmonizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageHarmonizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.harmonizabilityStatusService.getWorkspaceHarmonizabilityInventory(
        workspaceId,
      )
    const records = buildHarmonizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.harmonizabilityStatusService.pingPostgres()
    const stats = buildHarmonizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return harmonizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveHarmonizabilityAdminActions(),
      guidance: getHarmonizabilityAdminGuidance({ stats }),
    })
  }

  async executeHarmonizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_harmonizability_summary'
    },
  ) {
    this.assertCanManageHarmonizability(authContext)

    const payload = harmonizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_harmonizability_summary': {
        const summary = await this.getWorkspaceHarmonizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return harmonizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed harmonizability summary with ${summary.stats.harmonizabilityPercent}% meter usage harmonizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageHarmonizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production harmonizability tools.',
    })
  }
}
