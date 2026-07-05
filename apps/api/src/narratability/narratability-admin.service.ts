import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getNarratabilityRolloutGuidance,
  narratabilityAdminActionRequestSchema,
  narratabilityAdminActionResponseSchema,
  narratabilityAdminSummaryResponseSchema,
  narratabilityCapabilitiesResponseSchema,
  narratabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildNarratabilityAdminRecords,
  buildNarratabilityAdminStats,
  getNarratabilityAdminGuidance,
  resolveNarratabilityAdminActions,
} from './narratability-admin.helpers.js'
import { evaluateNarratabilityRollout } from './narratability-rollout.helpers.js'
import { NarratabilityStatusService } from './narratability-status.service.js'

@Injectable()
export class NarratabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly narratabilityStatusService: NarratabilityStatusService,
  ) {}

  getCapabilities() {
    return narratabilityCapabilitiesResponseSchema.parse({
      supportsNarratabilityRollout: true,
      supportsNarratabilityAdminTools: true,
      supportsMembershipNarratabilitySignals: true,
      supportsUsageEventNarratabilitySignals: true,
      guidance: getNarratabilityRolloutGuidance(),
    })
  }

  async getNarratabilityRollout() {
    const narratabilityTableCoverage =
      await this.narratabilityStatusService.getNarratabilityTableCoverage()

    const rollout = evaluateNarratabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.narratabilityStatusService.pingPostgres(),
      existingNarratabilityTableCount: narratabilityTableCoverage.existingNarratabilityTableCount,
      workspaceMembershipsTableExists: narratabilityTableCoverage.workspaceMembershipsTableExists,
      usageEventsTableExists: narratabilityTableCoverage.usageEventsTableExists,
      billingNotificationsTableExists: narratabilityTableCoverage.billingNotificationsTableExists,
    })

    return narratabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceNarratabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageNarratability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.narratabilityStatusService.getWorkspaceNarratabilityInventory(
        workspaceId,
      )
    const records = buildNarratabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.narratabilityStatusService.pingPostgres()
    const stats = buildNarratabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return narratabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveNarratabilityAdminActions(),
      guidance: getNarratabilityAdminGuidance({ stats }),
    })
  }

  async executeNarratabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_narratability_summary'
    },
  ) {
    this.assertCanManageNarratability(authContext)

    const payload = narratabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_narratability_summary': {
        const summary = await this.getWorkspaceNarratabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return narratabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed narratability summary with ${summary.stats.narratabilityPercent}% membership narratability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageNarratability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production narratability tools.',
    })
  }
}
