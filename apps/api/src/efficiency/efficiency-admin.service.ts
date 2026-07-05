import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getEfficiencyRolloutGuidance,
  efficiencyAdminActionRequestSchema,
  efficiencyAdminActionResponseSchema,
  efficiencyAdminSummaryResponseSchema,
  efficiencyCapabilitiesResponseSchema,
  efficiencyRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildEfficiencyAdminRecords,
  buildEfficiencyAdminStats,
  getEfficiencyAdminGuidance,
  resolveEfficiencyAdminActions,
} from './efficiency-admin.helpers.js'
import { evaluateEfficiencyRollout } from './efficiency-rollout.helpers.js'
import { EfficiencyStatusService } from './efficiency-status.service.js'

@Injectable()
export class EfficiencyAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly efficiencyStatusService: EfficiencyStatusService,
  ) {}

  getCapabilities() {
    return efficiencyCapabilitiesResponseSchema.parse({
      supportsEfficiencyRollout: true,
      supportsEfficiencyAdminTools: true,
      supportsUsageTelemetryEfficiencySignals: true,
      supportsCostLimitEfficiencySignals: true,
      guidance: getEfficiencyRolloutGuidance(),
    })
  }

  async getEfficiencyRollout() {
    const efficiencyTableCoverage =
      await this.efficiencyStatusService.getEfficiencyTableCoverage()

    const rollout = evaluateEfficiencyRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.efficiencyStatusService.pingPostgres(),
      existingEfficiencyTableCount:
        efficiencyTableCoverage.existingEfficiencyTableCount,
      usageEventsTableExists: efficiencyTableCoverage.usageEventsTableExists,
      usageLimitsTableExists: efficiencyTableCoverage.usageLimitsTableExists,
    })

    return efficiencyRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceEfficiencyAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageEfficiency(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.efficiencyStatusService.getWorkspaceEfficiencyInventory(
        workspaceId,
      )
    const records = buildEfficiencyAdminRecords(inventoryItems)
    const postgresConnectivity =
      await this.efficiencyStatusService.pingPostgres()
    const stats = buildEfficiencyAdminStats({
      records,
      postgresConnectivity,
    })

    return efficiencyAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveEfficiencyAdminActions(),
      guidance: getEfficiencyAdminGuidance({ stats }),
    })
  }

  async executeEfficiencyAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_efficiency_summary'
    },
  ) {
    this.assertCanManageEfficiency(authContext)

    const payload = efficiencyAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_efficiency_summary': {
        const summary = await this.getWorkspaceEfficiencyAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return efficiencyAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed efficiency summary with ${summary.stats.efficiencyPercent}% usage telemetry efficiency across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageEfficiency(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production efficiency tools.',
    })
  }
}
