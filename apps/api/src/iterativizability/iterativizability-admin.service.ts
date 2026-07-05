import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getIterativizabilityRolloutGuidance,
  iterativizabilityAdminActionRequestSchema,
  iterativizabilityAdminActionResponseSchema,
  iterativizabilityAdminSummaryResponseSchema,
  iterativizabilityCapabilitiesResponseSchema,
  iterativizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildIterativizabilityAdminRecords,
  buildIterativizabilityAdminStats,
  getIterativizabilityAdminGuidance,
  resolveIterativizabilityAdminActions,
} from './iterativizability-admin.helpers.js'
import { evaluateIterativizabilityRollout } from './iterativizability-rollout.helpers.js'
import { IterativizabilityStatusService } from './iterativizability-status.service.js'

@Injectable()
export class IterativizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly iterativizabilityStatusService: IterativizabilityStatusService,
  ) {}

  getCapabilities() {
    return iterativizabilityCapabilitiesResponseSchema.parse({
      supportsIterativizabilityRollout: true,
      supportsIterativizabilityAdminTools: true,
      supportsMeterUsageIterativizabilitySignals: true,
      supportsUsageEventIterativizabilitySignals: true,
      guidance: getIterativizabilityRolloutGuidance(),
    })
  }

  async getIterativizabilityRollout() {
    const iterativizabilityTableCoverage =
      await this.iterativizabilityStatusService.getIterativizabilityTableCoverage()

    const rollout = evaluateIterativizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.iterativizabilityStatusService.pingPostgres(),
      existingIterativizabilityTableCount: iterativizabilityTableCoverage.existingIterativizabilityTableCount,
      billingMeterUsageReportsTableExists: iterativizabilityTableCoverage.billingMeterUsageReportsTableExists,
      usageEventsTableExists: iterativizabilityTableCoverage.usageEventsTableExists,
      workspaceUsageLimitsTableExists: iterativizabilityTableCoverage.workspaceUsageLimitsTableExists,
    })

    return iterativizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceIterativizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageIterativizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.iterativizabilityStatusService.getWorkspaceIterativizabilityInventory(
        workspaceId,
      )
    const records = buildIterativizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.iterativizabilityStatusService.pingPostgres()
    const stats = buildIterativizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return iterativizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveIterativizabilityAdminActions(),
      guidance: getIterativizabilityAdminGuidance({ stats }),
    })
  }

  async executeIterativizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_iterativizability_summary'
    },
  ) {
    this.assertCanManageIterativizability(authContext)

    const payload = iterativizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_iterativizability_summary': {
        const summary = await this.getWorkspaceIterativizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return iterativizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed iterativizability summary with ${summary.stats.iterativizabilityPercent}% meter usage iterativizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageIterativizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production iterativizability tools.',
    })
  }
}
