import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getResponsivenessRolloutGuidance,
  responsivenessAdminActionRequestSchema,
  responsivenessAdminActionResponseSchema,
  responsivenessAdminSummaryResponseSchema,
  responsivenessCapabilitiesResponseSchema,
  responsivenessRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildResponsivenessAdminRecords,
  buildResponsivenessAdminStats,
  getResponsivenessAdminGuidance,
  resolveResponsivenessAdminActions,
} from './responsiveness-admin.helpers.js'
import { evaluateResponsivenessRollout } from './responsiveness-rollout.helpers.js'
import { ResponsivenessStatusService } from './responsiveness-status.service.js'

@Injectable()
export class ResponsivenessAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly responsivenessStatusService: ResponsivenessStatusService,
  ) {}

  getCapabilities() {
    return responsivenessCapabilitiesResponseSchema.parse({
      supportsResponsivenessRollout: true,
      supportsResponsivenessAdminTools: true,
      supportsUsageEventResponsivenessSignals: true,
      supportsMeterUsageResponsivenessSignals: true,
      guidance: getResponsivenessRolloutGuidance(),
    })
  }

  async getResponsivenessRollout() {
    const responsivenessTableCoverage =
      await this.responsivenessStatusService.getResponsivenessTableCoverage()

    const rollout = evaluateResponsivenessRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.responsivenessStatusService.pingPostgres(),
      existingResponsivenessTableCount: responsivenessTableCoverage.existingResponsivenessTableCount,
      usageEventsTableExists: responsivenessTableCoverage.usageEventsTableExists,
      billingMeterUsageReportsTableExists: responsivenessTableCoverage.billingMeterUsageReportsTableExists,
      workspaceUsageLimitsTableExists: responsivenessTableCoverage.workspaceUsageLimitsTableExists,
    })

    return responsivenessRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceResponsivenessAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageResponsiveness(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.responsivenessStatusService.getWorkspaceResponsivenessInventory(
        workspaceId,
      )
    const records = buildResponsivenessAdminRecords(inventoryItems)
    const postgresConnectivity = await this.responsivenessStatusService.pingPostgres()
    const stats = buildResponsivenessAdminStats({
      records,
      postgresConnectivity,
    })

    return responsivenessAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveResponsivenessAdminActions(),
      guidance: getResponsivenessAdminGuidance({ stats }),
    })
  }

  async executeResponsivenessAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_responsiveness_summary'
    },
  ) {
    this.assertCanManageResponsiveness(authContext)

    const payload = responsivenessAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_responsiveness_summary': {
        const summary = await this.getWorkspaceResponsivenessAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return responsivenessAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed responsiveness summary with ${summary.stats.responsivenessPercent}% usage event responsiveness across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageResponsiveness(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production responsiveness tools.',
    })
  }
}
