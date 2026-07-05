import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getMonitorizabilityRolloutGuidance,
  monitorizabilityAdminActionRequestSchema,
  monitorizabilityAdminActionResponseSchema,
  monitorizabilityAdminSummaryResponseSchema,
  monitorizabilityCapabilitiesResponseSchema,
  monitorizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildMonitorizabilityAdminRecords,
  buildMonitorizabilityAdminStats,
  getMonitorizabilityAdminGuidance,
  resolveMonitorizabilityAdminActions,
} from './monitorizability-admin.helpers.js'
import { evaluateMonitorizabilityRollout } from './monitorizability-rollout.helpers.js'
import { MonitorizabilityStatusService } from './monitorizability-status.service.js'

@Injectable()
export class MonitorizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly monitorizabilityStatusService: MonitorizabilityStatusService,
  ) {}

  getCapabilities() {
    return monitorizabilityCapabilitiesResponseSchema.parse({
      supportsMonitorizabilityRollout: true,
      supportsMonitorizabilityAdminTools: true,
      supportsMembershipMonitorizabilitySignals: true,
      supportsUsageEventMonitorizabilitySignals: true,
      guidance: getMonitorizabilityRolloutGuidance(),
    })
  }

  async getMonitorizabilityRollout() {
    const monitorizabilityTableCoverage =
      await this.monitorizabilityStatusService.getMonitorizabilityTableCoverage()

    const rollout = evaluateMonitorizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.monitorizabilityStatusService.pingPostgres(),
      existingMonitorizabilityTableCount: monitorizabilityTableCoverage.existingMonitorizabilityTableCount,
      workspaceMembershipsTableExists: monitorizabilityTableCoverage.workspaceMembershipsTableExists,
      usageEventsTableExists: monitorizabilityTableCoverage.usageEventsTableExists,
      billingNotificationsTableExists: monitorizabilityTableCoverage.billingNotificationsTableExists,
    })

    return monitorizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceMonitorizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageMonitorizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.monitorizabilityStatusService.getWorkspaceMonitorizabilityInventory(
        workspaceId,
      )
    const records = buildMonitorizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.monitorizabilityStatusService.pingPostgres()
    const stats = buildMonitorizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return monitorizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveMonitorizabilityAdminActions(),
      guidance: getMonitorizabilityAdminGuidance({ stats }),
    })
  }

  async executeMonitorizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_monitorizability_summary'
    },
  ) {
    this.assertCanManageMonitorizability(authContext)

    const payload = monitorizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_monitorizability_summary': {
        const summary = await this.getWorkspaceMonitorizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return monitorizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed monitorizability summary with ${summary.stats.monitorizabilityPercent}% membership monitorizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageMonitorizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production monitorizability tools.',
    })
  }
}
