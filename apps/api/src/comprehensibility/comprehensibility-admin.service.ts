import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getComprehensibilityRolloutGuidance,
  comprehensibilityAdminActionRequestSchema,
  comprehensibilityAdminActionResponseSchema,
  comprehensibilityAdminSummaryResponseSchema,
  comprehensibilityCapabilitiesResponseSchema,
  comprehensibilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildComprehensibilityAdminRecords,
  buildComprehensibilityAdminStats,
  getComprehensibilityAdminGuidance,
  resolveComprehensibilityAdminActions,
} from './comprehensibility-admin.helpers.js'
import { evaluateComprehensibilityRollout } from './comprehensibility-rollout.helpers.js'
import { ComprehensibilityStatusService } from './comprehensibility-status.service.js'

@Injectable()
export class ComprehensibilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly comprehensibilityStatusService: ComprehensibilityStatusService,
  ) {}

  getCapabilities() {
    return comprehensibilityCapabilitiesResponseSchema.parse({
      supportsComprehensibilityRollout: true,
      supportsComprehensibilityAdminTools: true,
      supportsAgentOutputComprehensibilitySignals: true,
      supportsSynthesisComprehensibilitySignals: true,
      guidance: getComprehensibilityRolloutGuidance(),
    })
  }

  async getComprehensibilityRollout() {
    const comprehensibilityTableCoverage =
      await this.comprehensibilityStatusService.getComprehensibilityTableCoverage()

    const rollout = evaluateComprehensibilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.comprehensibilityStatusService.pingPostgres(),
      existingComprehensibilityTableCount: comprehensibilityTableCoverage.existingComprehensibilityTableCount,
      agentOutputsTableExists: comprehensibilityTableCoverage.agentOutputsTableExists,
      moderatorSynthesesTableExists: comprehensibilityTableCoverage.moderatorSynthesesTableExists,
      artifactsTableExists: comprehensibilityTableCoverage.artifactsTableExists,
    })

    return comprehensibilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceComprehensibilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageComprehensibility(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.comprehensibilityStatusService.getWorkspaceComprehensibilityInventory(
        workspaceId,
      )
    const records = buildComprehensibilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.comprehensibilityStatusService.pingPostgres()
    const stats = buildComprehensibilityAdminStats({
      records,
      postgresConnectivity,
    })

    return comprehensibilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveComprehensibilityAdminActions(),
      guidance: getComprehensibilityAdminGuidance({ stats }),
    })
  }

  async executeComprehensibilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_comprehensibility_summary'
    },
  ) {
    this.assertCanManageComprehensibility(authContext)

    const payload = comprehensibilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_comprehensibility_summary': {
        const summary = await this.getWorkspaceComprehensibilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return comprehensibilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed comprehensibility summary with ${summary.stats.comprehensibilityPercent}% agent output comprehensibility across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageComprehensibility(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production comprehensibility tools.',
    })
  }
}
