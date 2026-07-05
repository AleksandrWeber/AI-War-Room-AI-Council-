import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getIntelligibilityRolloutGuidance,
  intelligibilityAdminActionRequestSchema,
  intelligibilityAdminActionResponseSchema,
  intelligibilityAdminSummaryResponseSchema,
  intelligibilityCapabilitiesResponseSchema,
  intelligibilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildIntelligibilityAdminRecords,
  buildIntelligibilityAdminStats,
  getIntelligibilityAdminGuidance,
  resolveIntelligibilityAdminActions,
} from './intelligibility-admin.helpers.js'
import { evaluateIntelligibilityRollout } from './intelligibility-rollout.helpers.js'
import { IntelligibilityStatusService } from './intelligibility-status.service.js'

@Injectable()
export class IntelligibilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly intelligibilityStatusService: IntelligibilityStatusService,
  ) {}

  getCapabilities() {
    return intelligibilityCapabilitiesResponseSchema.parse({
      supportsIntelligibilityRollout: true,
      supportsIntelligibilityAdminTools: true,
      supportsSynthesisIntelligibilitySignals: true,
      supportsAgentOutputIntelligibilitySignals: true,
      guidance: getIntelligibilityRolloutGuidance(),
    })
  }

  async getIntelligibilityRollout() {
    const intelligibilityTableCoverage =
      await this.intelligibilityStatusService.getIntelligibilityTableCoverage()

    const rollout = evaluateIntelligibilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.intelligibilityStatusService.pingPostgres(),
      existingIntelligibilityTableCount: intelligibilityTableCoverage.existingIntelligibilityTableCount,
      moderatorSynthesesTableExists: intelligibilityTableCoverage.moderatorSynthesesTableExists,
      agentOutputsTableExists: intelligibilityTableCoverage.agentOutputsTableExists,
      artifactsTableExists: intelligibilityTableCoverage.artifactsTableExists,
    })

    return intelligibilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceIntelligibilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageIntelligibility(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.intelligibilityStatusService.getWorkspaceIntelligibilityInventory(
        workspaceId,
      )
    const records = buildIntelligibilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.intelligibilityStatusService.pingPostgres()
    const stats = buildIntelligibilityAdminStats({
      records,
      postgresConnectivity,
    })

    return intelligibilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveIntelligibilityAdminActions(),
      guidance: getIntelligibilityAdminGuidance({ stats }),
    })
  }

  async executeIntelligibilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_intelligibility_summary'
    },
  ) {
    this.assertCanManageIntelligibility(authContext)

    const payload = intelligibilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_intelligibility_summary': {
        const summary = await this.getWorkspaceIntelligibilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return intelligibilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed intelligibility summary with ${summary.stats.intelligibilityPercent}% moderator synthesis intelligibility across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageIntelligibility(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production intelligibility tools.',
    })
  }
}
