import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getCompactizabilityRolloutGuidance,
  compactizabilityAdminActionRequestSchema,
  compactizabilityAdminActionResponseSchema,
  compactizabilityAdminSummaryResponseSchema,
  compactizabilityCapabilitiesResponseSchema,
  compactizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildCompactizabilityAdminRecords,
  buildCompactizabilityAdminStats,
  getCompactizabilityAdminGuidance,
  resolveCompactizabilityAdminActions,
} from './compactizability-admin.helpers.js'
import { evaluateCompactizabilityRollout } from './compactizability-rollout.helpers.js'
import { CompactizabilityStatusService } from './compactizability-status.service.js'

@Injectable()
export class CompactizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly compactizabilityStatusService: CompactizabilityStatusService,
  ) {}

  getCapabilities() {
    return compactizabilityCapabilitiesResponseSchema.parse({
      supportsCompactizabilityRollout: true,
      supportsCompactizabilityAdminTools: true,
      supportsMembershipCompactizabilitySignals: true,
      supportsUsageEventCompactizabilitySignals: true,
      guidance: getCompactizabilityRolloutGuidance(),
    })
  }

  async getCompactizabilityRollout() {
    const compactizabilityTableCoverage =
      await this.compactizabilityStatusService.getCompactizabilityTableCoverage()

    const rollout = evaluateCompactizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.compactizabilityStatusService.pingPostgres(),
      existingCompactizabilityTableCount: compactizabilityTableCoverage.existingCompactizabilityTableCount,
      workspaceMembershipsTableExists: compactizabilityTableCoverage.workspaceMembershipsTableExists,
      usageEventsTableExists: compactizabilityTableCoverage.usageEventsTableExists,
      billingNotificationsTableExists: compactizabilityTableCoverage.billingNotificationsTableExists,
    })

    return compactizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceCompactizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageCompactizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.compactizabilityStatusService.getWorkspaceCompactizabilityInventory(
        workspaceId,
      )
    const records = buildCompactizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.compactizabilityStatusService.pingPostgres()
    const stats = buildCompactizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return compactizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveCompactizabilityAdminActions(),
      guidance: getCompactizabilityAdminGuidance({ stats }),
    })
  }

  async executeCompactizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_compactizability_summary'
    },
  ) {
    this.assertCanManageCompactizability(authContext)

    const payload = compactizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_compactizability_summary': {
        const summary = await this.getWorkspaceCompactizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return compactizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed compactizability summary with ${summary.stats.compactizabilityPercent}% membership compactizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageCompactizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production compactizability tools.',
    })
  }
}
