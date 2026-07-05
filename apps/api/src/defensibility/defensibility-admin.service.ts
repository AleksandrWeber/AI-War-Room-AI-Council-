import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getDefensibilityRolloutGuidance,
  defensibilityAdminActionRequestSchema,
  defensibilityAdminActionResponseSchema,
  defensibilityAdminSummaryResponseSchema,
  defensibilityCapabilitiesResponseSchema,
  defensibilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildDefensibilityAdminRecords,
  buildDefensibilityAdminStats,
  getDefensibilityAdminGuidance,
  resolveDefensibilityAdminActions,
} from './defensibility-admin.helpers.js'
import { evaluateDefensibilityRollout } from './defensibility-rollout.helpers.js'
import { DefensibilityStatusService } from './defensibility-status.service.js'

@Injectable()
export class DefensibilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly defensibilityStatusService: DefensibilityStatusService,
  ) {}

  getCapabilities() {
    return defensibilityCapabilitiesResponseSchema.parse({
      supportsDefensibilityRollout: true,
      supportsDefensibilityAdminTools: true,
      supportsShieldReviewDefensibilitySignals: true,
      supportsArtifactDefensibilitySignals: true,
      guidance: getDefensibilityRolloutGuidance(),
    })
  }

  async getDefensibilityRollout() {
    const defensibilityTableCoverage =
      await this.defensibilityStatusService.getDefensibilityTableCoverage()

    const rollout = evaluateDefensibilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.defensibilityStatusService.pingPostgres(),
      existingDefensibilityTableCount: defensibilityTableCoverage.existingDefensibilityTableCount,
      shieldScansTableExists: defensibilityTableCoverage.shieldScansTableExists,
      artifactsTableExists: defensibilityTableCoverage.artifactsTableExists,
      moderatorSynthesesTableExists: defensibilityTableCoverage.moderatorSynthesesTableExists,
    })

    return defensibilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceDefensibilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageDefensibility(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.defensibilityStatusService.getWorkspaceDefensibilityInventory(
        workspaceId,
      )
    const records = buildDefensibilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.defensibilityStatusService.pingPostgres()
    const stats = buildDefensibilityAdminStats({
      records,
      postgresConnectivity,
    })

    return defensibilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveDefensibilityAdminActions(),
      guidance: getDefensibilityAdminGuidance({ stats }),
    })
  }

  async executeDefensibilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_defensibility_summary'
    },
  ) {
    this.assertCanManageDefensibility(authContext)

    const payload = defensibilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_defensibility_summary': {
        const summary = await this.getWorkspaceDefensibilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return defensibilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed defensibility summary with ${summary.stats.defensibilityPercent}% shield review defensibility across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageDefensibility(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production defensibility tools.',
    })
  }
}
