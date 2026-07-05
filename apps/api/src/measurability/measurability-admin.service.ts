import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getMeasurabilityRolloutGuidance,
  measurabilityAdminActionRequestSchema,
  measurabilityAdminActionResponseSchema,
  measurabilityAdminSummaryResponseSchema,
  measurabilityCapabilitiesResponseSchema,
  measurabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildMeasurabilityAdminRecords,
  buildMeasurabilityAdminStats,
  getMeasurabilityAdminGuidance,
  resolveMeasurabilityAdminActions,
} from './measurability-admin.helpers.js'
import { evaluateMeasurabilityRollout } from './measurability-rollout.helpers.js'
import { MeasurabilityStatusService } from './measurability-status.service.js'

@Injectable()
export class MeasurabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly measurabilityStatusService: MeasurabilityStatusService,
  ) {}

  getCapabilities() {
    return measurabilityCapabilitiesResponseSchema.parse({
      supportsMeasurabilityRollout: true,
      supportsMeasurabilityAdminTools: true,
      supportsMeterUsageMeasurabilitySignals: true,
      supportsUsageEventMeasurabilitySignals: true,
      guidance: getMeasurabilityRolloutGuidance(),
    })
  }

  async getMeasurabilityRollout() {
    const measurabilityTableCoverage =
      await this.measurabilityStatusService.getMeasurabilityTableCoverage()

    const rollout = evaluateMeasurabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.measurabilityStatusService.pingPostgres(),
      existingMeasurabilityTableCount: measurabilityTableCoverage.existingMeasurabilityTableCount,
      billingMeterUsageReportsTableExists: measurabilityTableCoverage.billingMeterUsageReportsTableExists,
      usageEventsTableExists: measurabilityTableCoverage.usageEventsTableExists,
      workspaceUsageLimitsTableExists: measurabilityTableCoverage.workspaceUsageLimitsTableExists,
    })

    return measurabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceMeasurabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageMeasurability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.measurabilityStatusService.getWorkspaceMeasurabilityInventory(
        workspaceId,
      )
    const records = buildMeasurabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.measurabilityStatusService.pingPostgres()
    const stats = buildMeasurabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return measurabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveMeasurabilityAdminActions(),
      guidance: getMeasurabilityAdminGuidance({ stats }),
    })
  }

  async executeMeasurabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_measurability_summary'
    },
  ) {
    this.assertCanManageMeasurability(authContext)

    const payload = measurabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_measurability_summary': {
        const summary = await this.getWorkspaceMeasurabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return measurabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed measurability summary with ${summary.stats.measurabilityPercent}% meter usage measurability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageMeasurability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production measurability tools.',
    })
  }
}
