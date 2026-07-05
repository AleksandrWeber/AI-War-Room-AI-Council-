import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getLearnabilityRolloutGuidance,
  learnabilityAdminActionRequestSchema,
  learnabilityAdminActionResponseSchema,
  learnabilityAdminSummaryResponseSchema,
  learnabilityCapabilitiesResponseSchema,
  learnabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildLearnabilityAdminRecords,
  buildLearnabilityAdminStats,
  getLearnabilityAdminGuidance,
  resolveLearnabilityAdminActions,
} from './learnability-admin.helpers.js'
import { evaluateLearnabilityRollout } from './learnability-rollout.helpers.js'
import { LearnabilityStatusService } from './learnability-status.service.js'

@Injectable()
export class LearnabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly learnabilityStatusService: LearnabilityStatusService,
  ) {}

  getCapabilities() {
    return learnabilityCapabilitiesResponseSchema.parse({
      supportsLearnabilityRollout: true,
      supportsLearnabilityAdminTools: true,
      supportsAgentOutputLearnabilitySignals: true,
      supportsArtifactLearnabilitySignals: true,
      guidance: getLearnabilityRolloutGuidance(),
    })
  }

  async getLearnabilityRollout() {
    const learnabilityTableCoverage =
      await this.learnabilityStatusService.getLearnabilityTableCoverage()

    const rollout = evaluateLearnabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.learnabilityStatusService.pingPostgres(),
      existingLearnabilityTableCount: learnabilityTableCoverage.existingLearnabilityTableCount,
      agentOutputsTableExists: learnabilityTableCoverage.agentOutputsTableExists,
      artifactsTableExists: learnabilityTableCoverage.artifactsTableExists,
      moderatorSynthesesTableExists: learnabilityTableCoverage.moderatorSynthesesTableExists,
    })

    return learnabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceLearnabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageLearnability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.learnabilityStatusService.getWorkspaceLearnabilityInventory(
        workspaceId,
      )
    const records = buildLearnabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.learnabilityStatusService.pingPostgres()
    const stats = buildLearnabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return learnabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveLearnabilityAdminActions(),
      guidance: getLearnabilityAdminGuidance({ stats }),
    })
  }

  async executeLearnabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_learnability_summary'
    },
  ) {
    this.assertCanManageLearnability(authContext)

    const payload = learnabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_learnability_summary': {
        const summary = await this.getWorkspaceLearnabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return learnabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed learnability summary with ${summary.stats.learnabilityPercent}% agent output learnability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageLearnability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production learnability tools.',
    })
  }
}
