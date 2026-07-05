import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getCuratizabilityRolloutGuidance,
  curatizabilityAdminActionRequestSchema,
  curatizabilityAdminActionResponseSchema,
  curatizabilityAdminSummaryResponseSchema,
  curatizabilityCapabilitiesResponseSchema,
  curatizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildCuratizabilityAdminRecords,
  buildCuratizabilityAdminStats,
  getCuratizabilityAdminGuidance,
  resolveCuratizabilityAdminActions,
} from './curatizability-admin.helpers.js'
import { evaluateCuratizabilityRollout } from './curatizability-rollout.helpers.js'
import { CuratizabilityStatusService } from './curatizability-status.service.js'

@Injectable()
export class CuratizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly curatizabilityStatusService: CuratizabilityStatusService,
  ) {}

  getCapabilities() {
    return curatizabilityCapabilitiesResponseSchema.parse({
      supportsCuratizabilityRollout: true,
      supportsCuratizabilityAdminTools: true,
      supportsMeterUsageCuratizabilitySignals: true,
      supportsUsageEventCuratizabilitySignals: true,
      guidance: getCuratizabilityRolloutGuidance(),
    })
  }

  async getCuratizabilityRollout() {
    const curatizabilityTableCoverage =
      await this.curatizabilityStatusService.getCuratizabilityTableCoverage()

    const rollout = evaluateCuratizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.curatizabilityStatusService.pingPostgres(),
      existingCuratizabilityTableCount: curatizabilityTableCoverage.existingCuratizabilityTableCount,
      billingMeterUsageReportsTableExists: curatizabilityTableCoverage.billingMeterUsageReportsTableExists,
      usageEventsTableExists: curatizabilityTableCoverage.usageEventsTableExists,
      workspaceUsageLimitsTableExists: curatizabilityTableCoverage.workspaceUsageLimitsTableExists,
    })

    return curatizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceCuratizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageCuratizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.curatizabilityStatusService.getWorkspaceCuratizabilityInventory(
        workspaceId,
      )
    const records = buildCuratizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.curatizabilityStatusService.pingPostgres()
    const stats = buildCuratizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return curatizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveCuratizabilityAdminActions(),
      guidance: getCuratizabilityAdminGuidance({ stats }),
    })
  }

  async executeCuratizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_curatizability_summary'
    },
  ) {
    this.assertCanManageCuratizability(authContext)

    const payload = curatizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_curatizability_summary': {
        const summary = await this.getWorkspaceCuratizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return curatizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed curatizability summary with ${summary.stats.curatizabilityPercent}% meter usage curatizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageCuratizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production curatizability tools.',
    })
  }
}
