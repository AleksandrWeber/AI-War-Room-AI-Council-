import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getGnoseizabilityRolloutGuidance,
  gnoseizabilityAdminActionRequestSchema,
  gnoseizabilityAdminActionResponseSchema,
  gnoseizabilityAdminSummaryResponseSchema,
  gnoseizabilityCapabilitiesResponseSchema,
  gnoseizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildGnoseizabilityAdminRecords,
  buildGnoseizabilityAdminStats,
  getGnoseizabilityAdminGuidance,
  resolveGnoseizabilityAdminActions,
} from './gnoseizability-admin.helpers.js'
import { evaluateGnoseizabilityRollout } from './gnoseizability-rollout.helpers.js'
import { GnoseizabilityStatusService } from './gnoseizability-status.service.js'

@Injectable()
export class GnoseizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly gnoseizabilityStatusService: GnoseizabilityStatusService,
  ) {}

  getCapabilities() {
    return gnoseizabilityCapabilitiesResponseSchema.parse({
      supportsGnoseizabilityRollout: true,
      supportsGnoseizabilityAdminTools: true,
      supportsMeterUsageGnoseizabilitySignals: true,
      supportsUsageEventGnoseizabilitySignals: true,
      guidance: getGnoseizabilityRolloutGuidance(),
    })
  }

  async getGnoseizabilityRollout() {
    const gnoseizabilityTableCoverage =
      await this.gnoseizabilityStatusService.getGnoseizabilityTableCoverage()

    const rollout = evaluateGnoseizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.gnoseizabilityStatusService.pingPostgres(),
      existingGnoseizabilityTableCount: gnoseizabilityTableCoverage.existingGnoseizabilityTableCount,
      billingMeterUsageReportsTableExists: gnoseizabilityTableCoverage.billingMeterUsageReportsTableExists,
      usageEventsTableExists: gnoseizabilityTableCoverage.usageEventsTableExists,
      workspaceUsageLimitsTableExists: gnoseizabilityTableCoverage.workspaceUsageLimitsTableExists,
    })

    return gnoseizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceGnoseizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageGnoseizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.gnoseizabilityStatusService.getWorkspaceGnoseizabilityInventory(
        workspaceId,
      )
    const records = buildGnoseizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.gnoseizabilityStatusService.pingPostgres()
    const stats = buildGnoseizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return gnoseizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveGnoseizabilityAdminActions(),
      guidance: getGnoseizabilityAdminGuidance({ stats }),
    })
  }

  async executeGnoseizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_gnoseizability_summary'
    },
  ) {
    this.assertCanManageGnoseizability(authContext)

    const payload = gnoseizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_gnoseizability_summary': {
        const summary = await this.getWorkspaceGnoseizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return gnoseizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed gnoseizability summary with ${summary.stats.gnoseizabilityPercent}% meter usage gnoseizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageGnoseizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production gnoseizability tools.',
    })
  }
}
