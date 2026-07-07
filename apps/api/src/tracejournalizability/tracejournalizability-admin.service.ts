import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getTracejournalizabilityRolloutGuidance,
  tracejournalizabilityAdminActionRequestSchema,
  tracejournalizabilityAdminActionResponseSchema,
  tracejournalizabilityAdminSummaryResponseSchema,
  tracejournalizabilityCapabilitiesResponseSchema,
  tracejournalizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildTracejournalizabilityAdminRecords,
  buildTracejournalizabilityAdminStats,
  getTracejournalizabilityAdminGuidance,
  resolveTracejournalizabilityAdminActions,
} from './tracejournalizability-admin.helpers.js'
import { evaluateTracejournalizabilityRollout } from './tracejournalizability-rollout.helpers.js'
import { TracejournalizabilityStatusService } from './tracejournalizability-status.service.js'

@Injectable()
export class TracejournalizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly tracejournalizabilityStatusService: TracejournalizabilityStatusService,
  ) {}

  getCapabilities() {
    return tracejournalizabilityCapabilitiesResponseSchema.parse({
      supportsTracejournalizabilityRollout: true,
      supportsTracejournalizabilityAdminTools: true,
      supportsMembershipTracejournalizabilitySignals: true,
      supportsUsageEventTracejournalizabilitySignals: true,
      guidance: getTracejournalizabilityRolloutGuidance(),
    })
  }

  async getTracejournalizabilityRollout() {
    const tracejournalizabilityTableCoverage =
      await this.tracejournalizabilityStatusService.getTracejournalizabilityTableCoverage()

    const rollout = evaluateTracejournalizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.tracejournalizabilityStatusService.pingPostgres(),
      existingTracejournalizabilityTableCount: tracejournalizabilityTableCoverage.existingTracejournalizabilityTableCount,
      workspaceMembershipsTableExists: tracejournalizabilityTableCoverage.workspaceMembershipsTableExists,
      usageEventsTableExists: tracejournalizabilityTableCoverage.usageEventsTableExists,
      billingNotificationsTableExists: tracejournalizabilityTableCoverage.billingNotificationsTableExists,
    })

    return tracejournalizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceTracejournalizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageTracejournalizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.tracejournalizabilityStatusService.getWorkspaceTracejournalizabilityInventory(
        workspaceId,
      )
    const records = buildTracejournalizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.tracejournalizabilityStatusService.pingPostgres()
    const stats = buildTracejournalizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return tracejournalizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveTracejournalizabilityAdminActions(),
      guidance: getTracejournalizabilityAdminGuidance({ stats }),
    })
  }

  async executeTracejournalizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_tracejournalizability_summary'
    },
  ) {
    this.assertCanManageTracejournalizability(authContext)

    const payload = tracejournalizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_tracejournalizability_summary': {
        const summary = await this.getWorkspaceTracejournalizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return tracejournalizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed tracejournalizability summary with ${summary.stats.tracejournalizabilityPercent}% membership tracejournalizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageTracejournalizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production tracejournalizability tools.',
    })
  }
}
