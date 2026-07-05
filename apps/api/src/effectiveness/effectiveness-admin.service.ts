import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getEffectivenessRolloutGuidance,
  effectivenessAdminActionRequestSchema,
  effectivenessAdminActionResponseSchema,
  effectivenessAdminSummaryResponseSchema,
  effectivenessCapabilitiesResponseSchema,
  effectivenessRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildEffectivenessAdminRecords,
  buildEffectivenessAdminStats,
  getEffectivenessAdminGuidance,
  resolveEffectivenessAdminActions,
} from './effectiveness-admin.helpers.js'
import { evaluateEffectivenessRollout } from './effectiveness-rollout.helpers.js'
import { EffectivenessStatusService } from './effectiveness-status.service.js'

@Injectable()
export class EffectivenessAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly effectivenessStatusService: EffectivenessStatusService,
  ) {}

  getCapabilities() {
    return effectivenessCapabilitiesResponseSchema.parse({
      supportsEffectivenessRollout: true,
      supportsEffectivenessAdminTools: true,
      supportsAgentOutputEffectivenessSignals: true,
      supportsSynthesisEffectivenessSignals: true,
      guidance: getEffectivenessRolloutGuidance(),
    })
  }

  async getEffectivenessRollout() {
    const effectivenessTableCoverage =
      await this.effectivenessStatusService.getEffectivenessTableCoverage()

    const rollout = evaluateEffectivenessRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.effectivenessStatusService.pingPostgres(),
      existingEffectivenessTableCount: effectivenessTableCoverage.existingEffectivenessTableCount,
      agentOutputsTableExists: effectivenessTableCoverage.agentOutputsTableExists,
      moderatorSynthesesTableExists: effectivenessTableCoverage.moderatorSynthesesTableExists,
      artifactsTableExists: effectivenessTableCoverage.artifactsTableExists,
    })

    return effectivenessRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceEffectivenessAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageEffectiveness(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.effectivenessStatusService.getWorkspaceEffectivenessInventory(
        workspaceId,
      )
    const records = buildEffectivenessAdminRecords(inventoryItems)
    const postgresConnectivity = await this.effectivenessStatusService.pingPostgres()
    const stats = buildEffectivenessAdminStats({
      records,
      postgresConnectivity,
    })

    return effectivenessAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveEffectivenessAdminActions(),
      guidance: getEffectivenessAdminGuidance({ stats }),
    })
  }

  async executeEffectivenessAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_effectiveness_summary'
    },
  ) {
    this.assertCanManageEffectiveness(authContext)

    const payload = effectivenessAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_effectiveness_summary': {
        const summary = await this.getWorkspaceEffectivenessAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return effectivenessAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed effectiveness summary with ${summary.stats.effectivenessPercent}% agent output effectiveness across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageEffectiveness(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production effectiveness tools.',
    })
  }
}
