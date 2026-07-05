import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getUnderstandabilityRolloutGuidance,
  understandabilityAdminActionRequestSchema,
  understandabilityAdminActionResponseSchema,
  understandabilityAdminSummaryResponseSchema,
  understandabilityCapabilitiesResponseSchema,
  understandabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildUnderstandabilityAdminRecords,
  buildUnderstandabilityAdminStats,
  getUnderstandabilityAdminGuidance,
  resolveUnderstandabilityAdminActions,
} from './understandability-admin.helpers.js'
import { evaluateUnderstandabilityRollout } from './understandability-rollout.helpers.js'
import { UnderstandabilityStatusService } from './understandability-status.service.js'

@Injectable()
export class UnderstandabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly understandabilityStatusService: UnderstandabilityStatusService,
  ) {}

  getCapabilities() {
    return understandabilityCapabilitiesResponseSchema.parse({
      supportsUnderstandabilityRollout: true,
      supportsUnderstandabilityAdminTools: true,
      supportsSynthesisUnderstandabilitySignals: true,
      supportsAgentOutputUnderstandabilitySignals: true,
      guidance: getUnderstandabilityRolloutGuidance(),
    })
  }

  async getUnderstandabilityRollout() {
    const understandabilityTableCoverage =
      await this.understandabilityStatusService.getUnderstandabilityTableCoverage()

    const rollout = evaluateUnderstandabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.understandabilityStatusService.pingPostgres(),
      existingUnderstandabilityTableCount: understandabilityTableCoverage.existingUnderstandabilityTableCount,
      moderatorSynthesesTableExists: understandabilityTableCoverage.moderatorSynthesesTableExists,
      agentOutputsTableExists: understandabilityTableCoverage.agentOutputsTableExists,
      artifactsTableExists: understandabilityTableCoverage.artifactsTableExists,
    })

    return understandabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceUnderstandabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageUnderstandability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.understandabilityStatusService.getWorkspaceUnderstandabilityInventory(
        workspaceId,
      )
    const records = buildUnderstandabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.understandabilityStatusService.pingPostgres()
    const stats = buildUnderstandabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return understandabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveUnderstandabilityAdminActions(),
      guidance: getUnderstandabilityAdminGuidance({ stats }),
    })
  }

  async executeUnderstandabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_understandability_summary'
    },
  ) {
    this.assertCanManageUnderstandability(authContext)

    const payload = understandabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_understandability_summary': {
        const summary = await this.getWorkspaceUnderstandabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return understandabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed understandability summary with ${summary.stats.understandabilityPercent}% moderator synthesis understandability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageUnderstandability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production understandability tools.',
    })
  }
}
