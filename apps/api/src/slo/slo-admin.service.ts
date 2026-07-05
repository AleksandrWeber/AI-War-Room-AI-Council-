import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getSloRolloutGuidance,
  sloAdminActionRequestSchema,
  sloAdminActionResponseSchema,
  sloAdminSummaryResponseSchema,
  sloCapabilitiesResponseSchema,
  sloRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import { ObservabilityService } from '../observability/observability.service.js'
import {
  buildSloAdminRecords,
  buildSloAdminStats,
  getSloAdminGuidance,
  resolveSloAdminActions,
} from './slo-admin.helpers.js'
import { evaluateSloRollout } from './slo-rollout.helpers.js'
import { SloStatusService } from './slo-status.service.js'

@Injectable()
export class SloAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly sloStatusService: SloStatusService,
    private readonly observabilityService: ObservabilityService,
  ) {}

  getCapabilities() {
    return sloCapabilitiesResponseSchema.parse({
      supportsSloRollout: true,
      supportsSloAdminTools: true,
      supportsUsageEventSloSignals: true,
      supportsObservabilitySloBuffer: true,
      guidance: getSloRolloutGuidance(),
    })
  }

  async getSloRollout() {
    const sloTableCoverage = await this.sloStatusService.getSloTableCoverage()
    const rollout = evaluateSloRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.sloStatusService.pingPostgres(),
      existingSloTableCount: sloTableCoverage.existingSloTableCount,
      observabilityBufferCapacity:
        this.observabilityService.getRecentEventBufferCapacity(),
      modelHealthEventTableExists: sloTableCoverage.modelHealthEventTableExists,
    })

    return sloRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceSloAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageSlo(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const observabilityErrorCount = this.countObservabilityErrorEvents(
      workspaceId,
    )
    const inventoryItems = await this.sloStatusService.getWorkspaceSloInventory(
      workspaceId,
      observabilityErrorCount,
    )
    const records = buildSloAdminRecords(inventoryItems)
    const postgresConnectivity = await this.sloStatusService.pingPostgres()
    const stats = buildSloAdminStats({
      records,
      postgresConnectivity,
    })

    return sloAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveSloAdminActions(),
      guidance: getSloAdminGuidance({ stats }),
    })
  }

  async executeSloAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_slo_summary'
    },
  ) {
    this.assertCanManageSlo(authContext)

    const payload = sloAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_slo_summary': {
        const summary = await this.getWorkspaceSloAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return sloAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed SLO summary with ${summary.stats.successRatePercent}% run success rate across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private countObservabilityErrorEvents(workspaceId: string) {
    return this.observabilityService
      .getRecentEventsForWorkspace(workspaceId)
      .filter((event) => event.level === 'error').length
  }

  private assertCanManageSlo(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production SLO tools.',
    })
  }
}
