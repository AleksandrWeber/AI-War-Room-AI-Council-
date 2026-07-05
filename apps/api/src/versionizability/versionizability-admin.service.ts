import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getVersionizabilityRolloutGuidance,
  versionizabilityAdminActionRequestSchema,
  versionizabilityAdminActionResponseSchema,
  versionizabilityAdminSummaryResponseSchema,
  versionizabilityCapabilitiesResponseSchema,
  versionizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildVersionizabilityAdminRecords,
  buildVersionizabilityAdminStats,
  getVersionizabilityAdminGuidance,
  resolveVersionizabilityAdminActions,
} from './versionizability-admin.helpers.js'
import { evaluateVersionizabilityRollout } from './versionizability-rollout.helpers.js'
import { VersionizabilityStatusService } from './versionizability-status.service.js'

@Injectable()
export class VersionizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly versionizabilityStatusService: VersionizabilityStatusService,
  ) {}

  getCapabilities() {
    return versionizabilityCapabilitiesResponseSchema.parse({
      supportsVersionizabilityRollout: true,
      supportsVersionizabilityAdminTools: true,
      supportsMeterUsageVersionizabilitySignals: true,
      supportsUsageEventVersionizabilitySignals: true,
      guidance: getVersionizabilityRolloutGuidance(),
    })
  }

  async getVersionizabilityRollout() {
    const versionizabilityTableCoverage =
      await this.versionizabilityStatusService.getVersionizabilityTableCoverage()

    const rollout = evaluateVersionizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.versionizabilityStatusService.pingPostgres(),
      existingVersionizabilityTableCount: versionizabilityTableCoverage.existingVersionizabilityTableCount,
      billingMeterUsageReportsTableExists: versionizabilityTableCoverage.billingMeterUsageReportsTableExists,
      usageEventsTableExists: versionizabilityTableCoverage.usageEventsTableExists,
      workspaceUsageLimitsTableExists: versionizabilityTableCoverage.workspaceUsageLimitsTableExists,
    })

    return versionizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceVersionizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageVersionizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.versionizabilityStatusService.getWorkspaceVersionizabilityInventory(
        workspaceId,
      )
    const records = buildVersionizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.versionizabilityStatusService.pingPostgres()
    const stats = buildVersionizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return versionizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveVersionizabilityAdminActions(),
      guidance: getVersionizabilityAdminGuidance({ stats }),
    })
  }

  async executeVersionizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_versionizability_summary'
    },
  ) {
    this.assertCanManageVersionizability(authContext)

    const payload = versionizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_versionizability_summary': {
        const summary = await this.getWorkspaceVersionizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return versionizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed versionizability summary with ${summary.stats.versionizabilityPercent}% meter usage versionizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageVersionizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production versionizability tools.',
    })
  }
}
