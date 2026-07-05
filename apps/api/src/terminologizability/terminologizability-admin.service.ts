import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getTerminologizabilityRolloutGuidance,
  terminologizabilityAdminActionRequestSchema,
  terminologizabilityAdminActionResponseSchema,
  terminologizabilityAdminSummaryResponseSchema,
  terminologizabilityCapabilitiesResponseSchema,
  terminologizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildTerminologizabilityAdminRecords,
  buildTerminologizabilityAdminStats,
  getTerminologizabilityAdminGuidance,
  resolveTerminologizabilityAdminActions,
} from './terminologizability-admin.helpers.js'
import { evaluateTerminologizabilityRollout } from './terminologizability-rollout.helpers.js'
import { TerminologizabilityStatusService } from './terminologizability-status.service.js'

@Injectable()
export class TerminologizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly terminologizabilityStatusService: TerminologizabilityStatusService,
  ) {}

  getCapabilities() {
    return terminologizabilityCapabilitiesResponseSchema.parse({
      supportsTerminologizabilityRollout: true,
      supportsTerminologizabilityAdminTools: true,
      supportsMembershipTerminologizabilitySignals: true,
      supportsUsageEventTerminologizabilitySignals: true,
      guidance: getTerminologizabilityRolloutGuidance(),
    })
  }

  async getTerminologizabilityRollout() {
    const terminologizabilityTableCoverage =
      await this.terminologizabilityStatusService.getTerminologizabilityTableCoverage()

    const rollout = evaluateTerminologizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.terminologizabilityStatusService.pingPostgres(),
      existingTerminologizabilityTableCount: terminologizabilityTableCoverage.existingTerminologizabilityTableCount,
      workspaceMembershipsTableExists: terminologizabilityTableCoverage.workspaceMembershipsTableExists,
      usageEventsTableExists: terminologizabilityTableCoverage.usageEventsTableExists,
      billingNotificationsTableExists: terminologizabilityTableCoverage.billingNotificationsTableExists,
    })

    return terminologizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceTerminologizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageTerminologizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.terminologizabilityStatusService.getWorkspaceTerminologizabilityInventory(
        workspaceId,
      )
    const records = buildTerminologizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.terminologizabilityStatusService.pingPostgres()
    const stats = buildTerminologizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return terminologizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveTerminologizabilityAdminActions(),
      guidance: getTerminologizabilityAdminGuidance({ stats }),
    })
  }

  async executeTerminologizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_terminologizability_summary'
    },
  ) {
    this.assertCanManageTerminologizability(authContext)

    const payload = terminologizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_terminologizability_summary': {
        const summary = await this.getWorkspaceTerminologizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return terminologizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed terminologizability summary with ${summary.stats.terminologizabilityPercent}% membership terminologizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageTerminologizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production terminologizability tools.',
    })
  }
}
