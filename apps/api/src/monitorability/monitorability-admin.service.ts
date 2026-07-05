import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getMonitorabilityRolloutGuidance,
  monitorabilityAdminActionRequestSchema,
  monitorabilityAdminActionResponseSchema,
  monitorabilityAdminSummaryResponseSchema,
  monitorabilityCapabilitiesResponseSchema,
  monitorabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildMonitorabilityAdminRecords,
  buildMonitorabilityAdminStats,
  getMonitorabilityAdminGuidance,
  resolveMonitorabilityAdminActions,
} from './monitorability-admin.helpers.js'
import { evaluateMonitorabilityRollout } from './monitorability-rollout.helpers.js'
import { MonitorabilityStatusService } from './monitorability-status.service.js'

@Injectable()
export class MonitorabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly monitorabilityStatusService: MonitorabilityStatusService,
  ) {}

  getCapabilities() {
    return monitorabilityCapabilitiesResponseSchema.parse({
      supportsMonitorabilityRollout: true,
      supportsMonitorabilityAdminTools: true,
      supportsUsageEventMonitorabilitySignals: true,
      supportsBillingRecordMonitorabilitySignals: true,
      guidance: getMonitorabilityRolloutGuidance(),
    })
  }

  async getMonitorabilityRollout() {
    const monitorabilityTableCoverage =
      await this.monitorabilityStatusService.getMonitorabilityTableCoverage()

    const rollout = evaluateMonitorabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.monitorabilityStatusService.pingPostgres(),
      existingMonitorabilityTableCount: monitorabilityTableCoverage.existingMonitorabilityTableCount,
      usageEventsTableExists: monitorabilityTableCoverage.usageEventsTableExists,
      billingRecordsTableExists: monitorabilityTableCoverage.billingRecordsTableExists,
      shieldScansTableExists: monitorabilityTableCoverage.shieldScansTableExists,
    })

    return monitorabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceMonitorabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageMonitorability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.monitorabilityStatusService.getWorkspaceMonitorabilityInventory(
        workspaceId,
      )
    const records = buildMonitorabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.monitorabilityStatusService.pingPostgres()
    const stats = buildMonitorabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return monitorabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveMonitorabilityAdminActions(),
      guidance: getMonitorabilityAdminGuidance({ stats }),
    })
  }

  async executeMonitorabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_monitorability_summary'
    },
  ) {
    this.assertCanManageMonitorability(authContext)

    const payload = monitorabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_monitorability_summary': {
        const summary = await this.getWorkspaceMonitorabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return monitorabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed monitorability summary with ${summary.stats.monitorabilityPercent}% usage event monitorability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageMonitorability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production monitorability tools.',
    })
  }
}
