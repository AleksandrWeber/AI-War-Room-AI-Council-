import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getSuitabilityRolloutGuidance,
  suitabilityAdminActionRequestSchema,
  suitabilityAdminActionResponseSchema,
  suitabilityAdminSummaryResponseSchema,
  suitabilityCapabilitiesResponseSchema,
  suitabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildSuitabilityAdminRecords,
  buildSuitabilityAdminStats,
  getSuitabilityAdminGuidance,
  resolveSuitabilityAdminActions,
} from './suitability-admin.helpers.js'
import { evaluateSuitabilityRollout } from './suitability-rollout.helpers.js'
import { SuitabilityStatusService } from './suitability-status.service.js'

@Injectable()
export class SuitabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly suitabilityStatusService: SuitabilityStatusService,
  ) {}

  getCapabilities() {
    return suitabilityCapabilitiesResponseSchema.parse({
      supportsSuitabilityRollout: true,
      supportsSuitabilityAdminTools: true,
      supportsAgentOutputSuitabilitySignals: true,
      supportsArtifactSuitabilitySignals: true,
      guidance: getSuitabilityRolloutGuidance(),
    })
  }

  async getSuitabilityRollout() {
    const suitabilityTableCoverage =
      await this.suitabilityStatusService.getSuitabilityTableCoverage()

    const rollout = evaluateSuitabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.suitabilityStatusService.pingPostgres(),
      existingSuitabilityTableCount: suitabilityTableCoverage.existingSuitabilityTableCount,
      agentOutputsTableExists: suitabilityTableCoverage.agentOutputsTableExists,
      artifactsTableExists: suitabilityTableCoverage.artifactsTableExists,
      moderatorSynthesesTableExists: suitabilityTableCoverage.moderatorSynthesesTableExists,
    })

    return suitabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceSuitabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageSuitability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.suitabilityStatusService.getWorkspaceSuitabilityInventory(
        workspaceId,
      )
    const records = buildSuitabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.suitabilityStatusService.pingPostgres()
    const stats = buildSuitabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return suitabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveSuitabilityAdminActions(),
      guidance: getSuitabilityAdminGuidance({ stats }),
    })
  }

  async executeSuitabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_suitability_summary'
    },
  ) {
    this.assertCanManageSuitability(authContext)

    const payload = suitabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_suitability_summary': {
        const summary = await this.getWorkspaceSuitabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return suitabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed suitability summary with ${summary.stats.suitabilityPercent}% agent output suitability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageSuitability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production suitability tools.',
    })
  }
}
