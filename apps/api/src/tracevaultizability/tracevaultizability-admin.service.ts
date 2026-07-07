import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getTracevaultizabilityRolloutGuidance,
  tracevaultizabilityAdminActionRequestSchema,
  tracevaultizabilityAdminActionResponseSchema,
  tracevaultizabilityAdminSummaryResponseSchema,
  tracevaultizabilityCapabilitiesResponseSchema,
  tracevaultizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildTracevaultizabilityAdminRecords,
  buildTracevaultizabilityAdminStats,
  getTracevaultizabilityAdminGuidance,
  resolveTracevaultizabilityAdminActions,
} from './tracevaultizability-admin.helpers.js'
import { evaluateTracevaultizabilityRollout } from './tracevaultizability-rollout.helpers.js'
import { TracevaultizabilityStatusService } from './tracevaultizability-status.service.js'

@Injectable()
export class TracevaultizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly tracevaultizabilityStatusService: TracevaultizabilityStatusService,
  ) {}

  getCapabilities() {
    return tracevaultizabilityCapabilitiesResponseSchema.parse({
      supportsTracevaultizabilityRollout: true,
      supportsTracevaultizabilityAdminTools: true,
      supportsMembershipTracevaultizabilitySignals: true,
      supportsUsageEventTracevaultizabilitySignals: true,
      guidance: getTracevaultizabilityRolloutGuidance(),
    })
  }

  async getTracevaultizabilityRollout() {
    const tracevaultizabilityTableCoverage =
      await this.tracevaultizabilityStatusService.getTracevaultizabilityTableCoverage()

    const rollout = evaluateTracevaultizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.tracevaultizabilityStatusService.pingPostgres(),
      existingTracevaultizabilityTableCount: tracevaultizabilityTableCoverage.existingTracevaultizabilityTableCount,
      workspaceMembershipsTableExists: tracevaultizabilityTableCoverage.workspaceMembershipsTableExists,
      usageEventsTableExists: tracevaultizabilityTableCoverage.usageEventsTableExists,
      billingNotificationsTableExists: tracevaultizabilityTableCoverage.billingNotificationsTableExists,
    })

    return tracevaultizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceTracevaultizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageTracevaultizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.tracevaultizabilityStatusService.getWorkspaceTracevaultizabilityInventory(
        workspaceId,
      )
    const records = buildTracevaultizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.tracevaultizabilityStatusService.pingPostgres()
    const stats = buildTracevaultizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return tracevaultizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveTracevaultizabilityAdminActions(),
      guidance: getTracevaultizabilityAdminGuidance({ stats }),
    })
  }

  async executeTracevaultizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_tracevaultizability_summary'
    },
  ) {
    this.assertCanManageTracevaultizability(authContext)

    const payload = tracevaultizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_tracevaultizability_summary': {
        const summary = await this.getWorkspaceTracevaultizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return tracevaultizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed tracevaultizability summary with ${summary.stats.tracevaultizabilityPercent}% membership tracevaultizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageTracevaultizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production tracevaultizability tools.',
    })
  }
}
