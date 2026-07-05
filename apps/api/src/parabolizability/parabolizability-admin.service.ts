import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getParabolizabilityRolloutGuidance,
  parabolizabilityAdminActionRequestSchema,
  parabolizabilityAdminActionResponseSchema,
  parabolizabilityAdminSummaryResponseSchema,
  parabolizabilityCapabilitiesResponseSchema,
  parabolizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildParabolizabilityAdminRecords,
  buildParabolizabilityAdminStats,
  getParabolizabilityAdminGuidance,
  resolveParabolizabilityAdminActions,
} from './parabolizability-admin.helpers.js'
import { evaluateParabolizabilityRollout } from './parabolizability-rollout.helpers.js'
import { ParabolizabilityStatusService } from './parabolizability-status.service.js'

@Injectable()
export class ParabolizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly parabolizabilityStatusService: ParabolizabilityStatusService,
  ) {}

  getCapabilities() {
    return parabolizabilityCapabilitiesResponseSchema.parse({
      supportsParabolizabilityRollout: true,
      supportsParabolizabilityAdminTools: true,
      supportsSynthesisParabolizabilitySignals: true,
      supportsAgentOutputParabolizabilitySignals: true,
      guidance: getParabolizabilityRolloutGuidance(),
    })
  }

  async getParabolizabilityRollout() {
    const parabolizabilityTableCoverage =
      await this.parabolizabilityStatusService.getParabolizabilityTableCoverage()

    const rollout = evaluateParabolizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.parabolizabilityStatusService.pingPostgres(),
      existingParabolizabilityTableCount: parabolizabilityTableCoverage.existingParabolizabilityTableCount,
      moderatorSynthesesTableExists: parabolizabilityTableCoverage.moderatorSynthesesTableExists,
      agentOutputsTableExists: parabolizabilityTableCoverage.agentOutputsTableExists,
      artifactsTableExists: parabolizabilityTableCoverage.artifactsTableExists,
    })

    return parabolizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceParabolizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageParabolizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.parabolizabilityStatusService.getWorkspaceParabolizabilityInventory(
        workspaceId,
      )
    const records = buildParabolizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.parabolizabilityStatusService.pingPostgres()
    const stats = buildParabolizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return parabolizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveParabolizabilityAdminActions(),
      guidance: getParabolizabilityAdminGuidance({ stats }),
    })
  }

  async executeParabolizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_parabolizability_summary'
    },
  ) {
    this.assertCanManageParabolizability(authContext)

    const payload = parabolizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_parabolizability_summary': {
        const summary = await this.getWorkspaceParabolizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return parabolizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed parabolizability summary with ${summary.stats.parabolizabilityPercent}% moderator synthesis parabolizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageParabolizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production parabolizability tools.',
    })
  }
}
