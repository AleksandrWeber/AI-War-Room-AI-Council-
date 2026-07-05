import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getAnalogizabilityRolloutGuidance,
  analogizabilityAdminActionRequestSchema,
  analogizabilityAdminActionResponseSchema,
  analogizabilityAdminSummaryResponseSchema,
  analogizabilityCapabilitiesResponseSchema,
  analogizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildAnalogizabilityAdminRecords,
  buildAnalogizabilityAdminStats,
  getAnalogizabilityAdminGuidance,
  resolveAnalogizabilityAdminActions,
} from './analogizability-admin.helpers.js'
import { evaluateAnalogizabilityRollout } from './analogizability-rollout.helpers.js'
import { AnalogizabilityStatusService } from './analogizability-status.service.js'

@Injectable()
export class AnalogizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly analogizabilityStatusService: AnalogizabilityStatusService,
  ) {}

  getCapabilities() {
    return analogizabilityCapabilitiesResponseSchema.parse({
      supportsAnalogizabilityRollout: true,
      supportsAnalogizabilityAdminTools: true,
      supportsUsageEventAnalogizabilitySignals: true,
      supportsMeterUsageAnalogizabilitySignals: true,
      guidance: getAnalogizabilityRolloutGuidance(),
    })
  }

  async getAnalogizabilityRollout() {
    const analogizabilityTableCoverage =
      await this.analogizabilityStatusService.getAnalogizabilityTableCoverage()

    const rollout = evaluateAnalogizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.analogizabilityStatusService.pingPostgres(),
      existingAnalogizabilityTableCount: analogizabilityTableCoverage.existingAnalogizabilityTableCount,
      usageEventsTableExists: analogizabilityTableCoverage.usageEventsTableExists,
      billingMeterUsageReportsTableExists: analogizabilityTableCoverage.billingMeterUsageReportsTableExists,
      workspaceUsageLimitsTableExists: analogizabilityTableCoverage.workspaceUsageLimitsTableExists,
    })

    return analogizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceAnalogizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageAnalogizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.analogizabilityStatusService.getWorkspaceAnalogizabilityInventory(
        workspaceId,
      )
    const records = buildAnalogizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.analogizabilityStatusService.pingPostgres()
    const stats = buildAnalogizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return analogizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveAnalogizabilityAdminActions(),
      guidance: getAnalogizabilityAdminGuidance({ stats }),
    })
  }

  async executeAnalogizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_analogizability_summary'
    },
  ) {
    this.assertCanManageAnalogizability(authContext)

    const payload = analogizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_analogizability_summary': {
        const summary = await this.getWorkspaceAnalogizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return analogizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed analogizability summary with ${summary.stats.analogizabilityPercent}% usage event analogizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageAnalogizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production analogizability tools.',
    })
  }
}
