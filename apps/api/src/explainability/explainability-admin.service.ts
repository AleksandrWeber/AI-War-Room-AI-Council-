import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getExplainabilityRolloutGuidance,
  explainabilityAdminActionRequestSchema,
  explainabilityAdminActionResponseSchema,
  explainabilityAdminSummaryResponseSchema,
  explainabilityCapabilitiesResponseSchema,
  explainabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildExplainabilityAdminRecords,
  buildExplainabilityAdminStats,
  getExplainabilityAdminGuidance,
  resolveExplainabilityAdminActions,
} from './explainability-admin.helpers.js'
import { evaluateExplainabilityRollout } from './explainability-rollout.helpers.js'
import { ExplainabilityStatusService } from './explainability-status.service.js'

@Injectable()
export class ExplainabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly explainabilityStatusService: ExplainabilityStatusService,
  ) {}

  getCapabilities() {
    return explainabilityCapabilitiesResponseSchema.parse({
      supportsExplainabilityRollout: true,
      supportsExplainabilityAdminTools: true,
      supportsSynthesisExplainabilitySignals: true,
      supportsAgentOutputExplainabilitySignals: true,
      guidance: getExplainabilityRolloutGuidance(),
    })
  }

  async getExplainabilityRollout() {
    const explainabilityTableCoverage =
      await this.explainabilityStatusService.getExplainabilityTableCoverage()

    const rollout = evaluateExplainabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.explainabilityStatusService.pingPostgres(),
      existingExplainabilityTableCount: explainabilityTableCoverage.existingExplainabilityTableCount,
      moderatorSynthesesTableExists: explainabilityTableCoverage.moderatorSynthesesTableExists,
      agentOutputsTableExists: explainabilityTableCoverage.agentOutputsTableExists,
      artifactsTableExists: explainabilityTableCoverage.artifactsTableExists,
    })

    return explainabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceExplainabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageExplainability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.explainabilityStatusService.getWorkspaceExplainabilityInventory(
        workspaceId,
      )
    const records = buildExplainabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.explainabilityStatusService.pingPostgres()
    const stats = buildExplainabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return explainabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveExplainabilityAdminActions(),
      guidance: getExplainabilityAdminGuidance({ stats }),
    })
  }

  async executeExplainabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_explainability_summary'
    },
  ) {
    this.assertCanManageExplainability(authContext)

    const payload = explainabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_explainability_summary': {
        const summary = await this.getWorkspaceExplainabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return explainabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed explainability summary with ${summary.stats.explainabilityPercent}% moderator synthesis explainability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageExplainability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production explainability tools.',
    })
  }
}
