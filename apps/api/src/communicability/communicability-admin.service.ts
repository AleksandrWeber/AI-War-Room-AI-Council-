import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getCommunicabilityRolloutGuidance,
  communicabilityAdminActionRequestSchema,
  communicabilityAdminActionResponseSchema,
  communicabilityAdminSummaryResponseSchema,
  communicabilityCapabilitiesResponseSchema,
  communicabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildCommunicabilityAdminRecords,
  buildCommunicabilityAdminStats,
  getCommunicabilityAdminGuidance,
  resolveCommunicabilityAdminActions,
} from './communicability-admin.helpers.js'
import { evaluateCommunicabilityRollout } from './communicability-rollout.helpers.js'
import { CommunicabilityStatusService } from './communicability-status.service.js'

@Injectable()
export class CommunicabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly communicabilityStatusService: CommunicabilityStatusService,
  ) {}

  getCapabilities() {
    return communicabilityCapabilitiesResponseSchema.parse({
      supportsCommunicabilityRollout: true,
      supportsCommunicabilityAdminTools: true,
      supportsSynthesisCommunicabilitySignals: true,
      supportsAgentOutputCommunicabilitySignals: true,
      guidance: getCommunicabilityRolloutGuidance(),
    })
  }

  async getCommunicabilityRollout() {
    const communicabilityTableCoverage =
      await this.communicabilityStatusService.getCommunicabilityTableCoverage()

    const rollout = evaluateCommunicabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.communicabilityStatusService.pingPostgres(),
      existingCommunicabilityTableCount: communicabilityTableCoverage.existingCommunicabilityTableCount,
      moderatorSynthesesTableExists: communicabilityTableCoverage.moderatorSynthesesTableExists,
      agentOutputsTableExists: communicabilityTableCoverage.agentOutputsTableExists,
      artifactsTableExists: communicabilityTableCoverage.artifactsTableExists,
    })

    return communicabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceCommunicabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageCommunicability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.communicabilityStatusService.getWorkspaceCommunicabilityInventory(
        workspaceId,
      )
    const records = buildCommunicabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.communicabilityStatusService.pingPostgres()
    const stats = buildCommunicabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return communicabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveCommunicabilityAdminActions(),
      guidance: getCommunicabilityAdminGuidance({ stats }),
    })
  }

  async executeCommunicabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_communicability_summary'
    },
  ) {
    this.assertCanManageCommunicability(authContext)

    const payload = communicabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_communicability_summary': {
        const summary = await this.getWorkspaceCommunicabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return communicabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed communicability summary with ${summary.stats.communicabilityPercent}% moderator synthesis communicability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageCommunicability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production communicability tools.',
    })
  }
}
