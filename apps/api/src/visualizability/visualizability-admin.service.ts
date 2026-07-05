import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getVisualizabilityRolloutGuidance,
  visualizabilityAdminActionRequestSchema,
  visualizabilityAdminActionResponseSchema,
  visualizabilityAdminSummaryResponseSchema,
  visualizabilityCapabilitiesResponseSchema,
  visualizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildVisualizabilityAdminRecords,
  buildVisualizabilityAdminStats,
  getVisualizabilityAdminGuidance,
  resolveVisualizabilityAdminActions,
} from './visualizability-admin.helpers.js'
import { evaluateVisualizabilityRollout } from './visualizability-rollout.helpers.js'
import { VisualizabilityStatusService } from './visualizability-status.service.js'

@Injectable()
export class VisualizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly visualizabilityStatusService: VisualizabilityStatusService,
  ) {}

  getCapabilities() {
    return visualizabilityCapabilitiesResponseSchema.parse({
      supportsVisualizabilityRollout: true,
      supportsVisualizabilityAdminTools: true,
      supportsModelRegistryVisualizabilitySignals: true,
      supportsModelHealthVisualizabilitySignals: true,
      guidance: getVisualizabilityRolloutGuidance(),
    })
  }

  async getVisualizabilityRollout() {
    const visualizabilityTableCoverage =
      await this.visualizabilityStatusService.getVisualizabilityTableCoverage()

    const rollout = evaluateVisualizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.visualizabilityStatusService.pingPostgres(),
      existingVisualizabilityTableCount: visualizabilityTableCoverage.existingVisualizabilityTableCount,
      modelRegistryEntriesTableExists: visualizabilityTableCoverage.modelRegistryEntriesTableExists,
      modelHealthEventsTableExists: visualizabilityTableCoverage.modelHealthEventsTableExists,
      workspaceProviderCredentialsTableExists: visualizabilityTableCoverage.workspaceProviderCredentialsTableExists,
    })

    return visualizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceVisualizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageVisualizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.visualizabilityStatusService.getWorkspaceVisualizabilityInventory(
        workspaceId,
      )
    const records = buildVisualizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.visualizabilityStatusService.pingPostgres()
    const stats = buildVisualizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return visualizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveVisualizabilityAdminActions(),
      guidance: getVisualizabilityAdminGuidance({ stats }),
    })
  }

  async executeVisualizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_visualizability_summary'
    },
  ) {
    this.assertCanManageVisualizability(authContext)

    const payload = visualizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_visualizability_summary': {
        const summary = await this.getWorkspaceVisualizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return visualizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed visualizability summary with ${summary.stats.visualizabilityPercent}% model registry visualizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageVisualizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production visualizability tools.',
    })
  }
}
