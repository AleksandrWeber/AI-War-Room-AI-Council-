import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getInspectabilityRolloutGuidance,
  inspectabilityAdminActionRequestSchema,
  inspectabilityAdminActionResponseSchema,
  inspectabilityAdminSummaryResponseSchema,
  inspectabilityCapabilitiesResponseSchema,
  inspectabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildInspectabilityAdminRecords,
  buildInspectabilityAdminStats,
  getInspectabilityAdminGuidance,
  resolveInspectabilityAdminActions,
} from './inspectability-admin.helpers.js'
import { evaluateInspectabilityRollout } from './inspectability-rollout.helpers.js'
import { InspectabilityStatusService } from './inspectability-status.service.js'

@Injectable()
export class InspectabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly inspectabilityStatusService: InspectabilityStatusService,
  ) {}

  getCapabilities() {
    return inspectabilityCapabilitiesResponseSchema.parse({
      supportsInspectabilityRollout: true,
      supportsInspectabilityAdminTools: true,
      supportsUsageInspectabilitySignals: true,
      supportsMeterUsageInspectabilitySignals: true,
      guidance: getInspectabilityRolloutGuidance(),
    })
  }

  async getInspectabilityRollout() {
    const inspectabilityTableCoverage =
      await this.inspectabilityStatusService.getInspectabilityTableCoverage()

    const rollout = evaluateInspectabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.inspectabilityStatusService.pingPostgres(),
      existingInspectabilityTableCount: inspectabilityTableCoverage.existingInspectabilityTableCount,
      usageEventsTableExists: inspectabilityTableCoverage.usageEventsTableExists,
      billingMeterUsageReportsTableExists: inspectabilityTableCoverage.billingMeterUsageReportsTableExists,
      workspaceUsageLimitsTableExists: inspectabilityTableCoverage.workspaceUsageLimitsTableExists,
    })

    return inspectabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceInspectabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageInspectability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.inspectabilityStatusService.getWorkspaceInspectabilityInventory(
        workspaceId,
      )
    const records = buildInspectabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.inspectabilityStatusService.pingPostgres()
    const stats = buildInspectabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return inspectabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveInspectabilityAdminActions(),
      guidance: getInspectabilityAdminGuidance({ stats }),
    })
  }

  async executeInspectabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_inspectability_summary'
    },
  ) {
    this.assertCanManageInspectability(authContext)

    const payload = inspectabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_inspectability_summary': {
        const summary = await this.getWorkspaceInspectabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return inspectabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed inspectability summary with ${summary.stats.inspectabilityPercent}% usage inspectability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageInspectability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production inspectability tools.',
    })
  }
}
