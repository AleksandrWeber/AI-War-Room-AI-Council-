import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getExplainabilityvaultizabilityRolloutGuidance,
  explainabilityvaultizabilityAdminActionRequestSchema,
  explainabilityvaultizabilityAdminActionResponseSchema,
  explainabilityvaultizabilityAdminSummaryResponseSchema,
  explainabilityvaultizabilityCapabilitiesResponseSchema,
  explainabilityvaultizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildExplainabilityvaultizabilityAdminRecords,
  buildExplainabilityvaultizabilityAdminStats,
  getExplainabilityvaultizabilityAdminGuidance,
  resolveExplainabilityvaultizabilityAdminActions,
} from './explainabilityvaultizability-admin.helpers.js'
import { evaluateExplainabilityvaultizabilityRollout } from './explainabilityvaultizability-rollout.helpers.js'
import { ExplainabilityvaultizabilityStatusService } from './explainabilityvaultizability-status.service.js'

@Injectable()
export class ExplainabilityvaultizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly explainabilityvaultizabilityStatusService: ExplainabilityvaultizabilityStatusService,
  ) {}

  getCapabilities() {
    return explainabilityvaultizabilityCapabilitiesResponseSchema.parse({
      supportsExplainabilityvaultizabilityRollout: true,
      supportsExplainabilityvaultizabilityAdminTools: true,
      supportsMembershipExplainabilityvaultizabilitySignals: true,
      supportsUsageEventExplainabilityvaultizabilitySignals: true,
      guidance: getExplainabilityvaultizabilityRolloutGuidance(),
    })
  }

  async getExplainabilityvaultizabilityRollout() {
    const explainabilityvaultizabilityTableCoverage =
      await this.explainabilityvaultizabilityStatusService.getExplainabilityvaultizabilityTableCoverage()

    const rollout = evaluateExplainabilityvaultizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.explainabilityvaultizabilityStatusService.pingPostgres(),
      existingExplainabilityvaultizabilityTableCount: explainabilityvaultizabilityTableCoverage.existingExplainabilityvaultizabilityTableCount,
      workspaceMembershipsTableExists: explainabilityvaultizabilityTableCoverage.workspaceMembershipsTableExists,
      usageEventsTableExists: explainabilityvaultizabilityTableCoverage.usageEventsTableExists,
      billingNotificationsTableExists: explainabilityvaultizabilityTableCoverage.billingNotificationsTableExists,
    })

    return explainabilityvaultizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceExplainabilityvaultizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageExplainabilityvaultizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.explainabilityvaultizabilityStatusService.getWorkspaceExplainabilityvaultizabilityInventory(
        workspaceId,
      )
    const records = buildExplainabilityvaultizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.explainabilityvaultizabilityStatusService.pingPostgres()
    const stats = buildExplainabilityvaultizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return explainabilityvaultizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveExplainabilityvaultizabilityAdminActions(),
      guidance: getExplainabilityvaultizabilityAdminGuidance({ stats }),
    })
  }

  async executeExplainabilityvaultizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_explainabilityvaultizability_summary'
    },
  ) {
    this.assertCanManageExplainabilityvaultizability(authContext)

    const payload = explainabilityvaultizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_explainabilityvaultizability_summary': {
        const summary = await this.getWorkspaceExplainabilityvaultizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return explainabilityvaultizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed explainabilityvaultizability summary with ${summary.stats.explainabilityvaultizabilityPercent}% membership explainabilityvaultizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageExplainabilityvaultizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production explainabilityvaultizability tools.',
    })
  }
}
