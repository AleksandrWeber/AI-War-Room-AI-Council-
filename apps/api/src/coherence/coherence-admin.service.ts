import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getCoherenceRolloutGuidance,
  coherenceAdminActionRequestSchema,
  coherenceAdminActionResponseSchema,
  coherenceAdminSummaryResponseSchema,
  coherenceCapabilitiesResponseSchema,
  coherenceRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildCoherenceAdminRecords,
  buildCoherenceAdminStats,
  getCoherenceAdminGuidance,
  resolveCoherenceAdminActions,
} from './coherence-admin.helpers.js'
import { evaluateCoherenceRollout } from './coherence-rollout.helpers.js'
import { CoherenceStatusService } from './coherence-status.service.js'

@Injectable()
export class CoherenceAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly coherenceStatusService: CoherenceStatusService,
  ) {}

  getCapabilities() {
    return coherenceCapabilitiesResponseSchema.parse({
      supportsCoherenceRollout: true,
      supportsCoherenceAdminTools: true,
      supportsWorkflowCoherenceSignals: true,
      supportsAgentOutputCoherenceSignals: true,
      guidance: getCoherenceRolloutGuidance(),
    })
  }

  async getCoherenceRollout() {
    const coherenceTableCoverage =
      await this.coherenceStatusService.getCoherenceTableCoverage()

    const rollout = evaluateCoherenceRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.coherenceStatusService.pingPostgres(),
      existingCoherenceTableCount: coherenceTableCoverage.existingCoherenceTableCount,
      runWorkflowsTableExists: coherenceTableCoverage.runWorkflowsTableExists,
      agentOutputsTableExists: coherenceTableCoverage.agentOutputsTableExists,
      moderatorSynthesesTableExists: coherenceTableCoverage.moderatorSynthesesTableExists,
    })

    return coherenceRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceCoherenceAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageCoherence(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.coherenceStatusService.getWorkspaceCoherenceInventory(
        workspaceId,
      )
    const records = buildCoherenceAdminRecords(inventoryItems)
    const postgresConnectivity = await this.coherenceStatusService.pingPostgres()
    const stats = buildCoherenceAdminStats({
      records,
      postgresConnectivity,
    })

    return coherenceAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveCoherenceAdminActions(),
      guidance: getCoherenceAdminGuidance({ stats }),
    })
  }

  async executeCoherenceAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_coherence_summary'
    },
  ) {
    this.assertCanManageCoherence(authContext)

    const payload = coherenceAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_coherence_summary': {
        const summary = await this.getWorkspaceCoherenceAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return coherenceAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed coherence summary with ${summary.stats.coherencePercent}% workflow coherence across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageCoherence(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production coherence tools.',
    })
  }
}
