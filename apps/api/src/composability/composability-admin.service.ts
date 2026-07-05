import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getComposabilityRolloutGuidance,
  composabilityAdminActionRequestSchema,
  composabilityAdminActionResponseSchema,
  composabilityAdminSummaryResponseSchema,
  composabilityCapabilitiesResponseSchema,
  composabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildComposabilityAdminRecords,
  buildComposabilityAdminStats,
  getComposabilityAdminGuidance,
  resolveComposabilityAdminActions,
} from './composability-admin.helpers.js'
import { evaluateComposabilityRollout } from './composability-rollout.helpers.js'
import { ComposabilityStatusService } from './composability-status.service.js'

@Injectable()
export class ComposabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly composabilityStatusService: ComposabilityStatusService,
  ) {}

  getCapabilities() {
    return composabilityCapabilitiesResponseSchema.parse({
      supportsComposabilityRollout: true,
      supportsComposabilityAdminTools: true,
      supportsWorkflowComposabilitySignals: true,
      supportsAgentOutputComposabilitySignals: true,
      guidance: getComposabilityRolloutGuidance(),
    })
  }

  async getComposabilityRollout() {
    const composabilityTableCoverage =
      await this.composabilityStatusService.getComposabilityTableCoverage()

    const rollout = evaluateComposabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.composabilityStatusService.pingPostgres(),
      existingComposabilityTableCount: composabilityTableCoverage.existingComposabilityTableCount,
      runWorkflowsTableExists: composabilityTableCoverage.runWorkflowsTableExists,
      agentOutputsTableExists: composabilityTableCoverage.agentOutputsTableExists,
      artifactsTableExists: composabilityTableCoverage.artifactsTableExists,
    })

    return composabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceComposabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageComposability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.composabilityStatusService.getWorkspaceComposabilityInventory(
        workspaceId,
      )
    const records = buildComposabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.composabilityStatusService.pingPostgres()
    const stats = buildComposabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return composabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveComposabilityAdminActions(),
      guidance: getComposabilityAdminGuidance({ stats }),
    })
  }

  async executeComposabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_composability_summary'
    },
  ) {
    this.assertCanManageComposability(authContext)

    const payload = composabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_composability_summary': {
        const summary = await this.getWorkspaceComposabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return composabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed composability summary with ${summary.stats.composabilityPercent}% workflow composability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageComposability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production composability tools.',
    })
  }
}
