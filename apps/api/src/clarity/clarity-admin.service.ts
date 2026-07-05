import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getClarityRolloutGuidance,
  clarityAdminActionRequestSchema,
  clarityAdminActionResponseSchema,
  clarityAdminSummaryResponseSchema,
  clarityCapabilitiesResponseSchema,
  clarityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildClarityAdminRecords,
  buildClarityAdminStats,
  getClarityAdminGuidance,
  resolveClarityAdminActions,
} from './clarity-admin.helpers.js'
import { evaluateClarityRollout } from './clarity-rollout.helpers.js'
import { ClarityStatusService } from './clarity-status.service.js'

@Injectable()
export class ClarityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly clarityStatusService: ClarityStatusService,
  ) {}

  getCapabilities() {
    return clarityCapabilitiesResponseSchema.parse({
      supportsClarityRollout: true,
      supportsClarityAdminTools: true,
      supportsSynthesisClaritySignals: true,
      supportsAgentOutputClaritySignals: true,
      guidance: getClarityRolloutGuidance(),
    })
  }

  async getClarityRollout() {
    const clarityTableCoverage =
      await this.clarityStatusService.getClarityTableCoverage()

    const rollout = evaluateClarityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.clarityStatusService.pingPostgres(),
      existingClarityTableCount: clarityTableCoverage.existingClarityTableCount,
      moderatorSynthesesTableExists: clarityTableCoverage.moderatorSynthesesTableExists,
      agentOutputsTableExists: clarityTableCoverage.agentOutputsTableExists,
      artifactsTableExists: clarityTableCoverage.artifactsTableExists,
    })

    return clarityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceClarityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageClarity(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.clarityStatusService.getWorkspaceClarityInventory(
        workspaceId,
      )
    const records = buildClarityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.clarityStatusService.pingPostgres()
    const stats = buildClarityAdminStats({
      records,
      postgresConnectivity,
    })

    return clarityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveClarityAdminActions(),
      guidance: getClarityAdminGuidance({ stats }),
    })
  }

  async executeClarityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_clarity_summary'
    },
  ) {
    this.assertCanManageClarity(authContext)

    const payload = clarityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_clarity_summary': {
        const summary = await this.getWorkspaceClarityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return clarityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed clarity summary with ${summary.stats.clarityPercent}% moderator synthesis clarity across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageClarity(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production clarity tools.',
    })
  }
}
