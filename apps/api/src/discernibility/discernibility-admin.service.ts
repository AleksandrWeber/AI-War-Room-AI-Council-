import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getDiscernibilityRolloutGuidance,
  discernibilityAdminActionRequestSchema,
  discernibilityAdminActionResponseSchema,
  discernibilityAdminSummaryResponseSchema,
  discernibilityCapabilitiesResponseSchema,
  discernibilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildDiscernibilityAdminRecords,
  buildDiscernibilityAdminStats,
  getDiscernibilityAdminGuidance,
  resolveDiscernibilityAdminActions,
} from './discernibility-admin.helpers.js'
import { evaluateDiscernibilityRollout } from './discernibility-rollout.helpers.js'
import { DiscernibilityStatusService } from './discernibility-status.service.js'

@Injectable()
export class DiscernibilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly discernibilityStatusService: DiscernibilityStatusService,
  ) {}

  getCapabilities() {
    return discernibilityCapabilitiesResponseSchema.parse({
      supportsDiscernibilityRollout: true,
      supportsDiscernibilityAdminTools: true,
      supportsSynthesisDiscernibilitySignals: true,
      supportsAgentOutputDiscernibilitySignals: true,
      guidance: getDiscernibilityRolloutGuidance(),
    })
  }

  async getDiscernibilityRollout() {
    const discernibilityTableCoverage =
      await this.discernibilityStatusService.getDiscernibilityTableCoverage()

    const rollout = evaluateDiscernibilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.discernibilityStatusService.pingPostgres(),
      existingDiscernibilityTableCount: discernibilityTableCoverage.existingDiscernibilityTableCount,
      moderatorSynthesesTableExists: discernibilityTableCoverage.moderatorSynthesesTableExists,
      agentOutputsTableExists: discernibilityTableCoverage.agentOutputsTableExists,
      artifactsTableExists: discernibilityTableCoverage.artifactsTableExists,
    })

    return discernibilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceDiscernibilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageDiscernibility(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.discernibilityStatusService.getWorkspaceDiscernibilityInventory(
        workspaceId,
      )
    const records = buildDiscernibilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.discernibilityStatusService.pingPostgres()
    const stats = buildDiscernibilityAdminStats({
      records,
      postgresConnectivity,
    })

    return discernibilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveDiscernibilityAdminActions(),
      guidance: getDiscernibilityAdminGuidance({ stats }),
    })
  }

  async executeDiscernibilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_discernibility_summary'
    },
  ) {
    this.assertCanManageDiscernibility(authContext)

    const payload = discernibilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_discernibility_summary': {
        const summary = await this.getWorkspaceDiscernibilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return discernibilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed discernibility summary with ${summary.stats.discernibilityPercent}% moderator synthesis discernibility across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageDiscernibility(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production discernibility tools.',
    })
  }
}
