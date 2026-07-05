import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getInterpretabilityRolloutGuidance,
  interpretabilityAdminActionRequestSchema,
  interpretabilityAdminActionResponseSchema,
  interpretabilityAdminSummaryResponseSchema,
  interpretabilityCapabilitiesResponseSchema,
  interpretabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildInterpretabilityAdminRecords,
  buildInterpretabilityAdminStats,
  getInterpretabilityAdminGuidance,
  resolveInterpretabilityAdminActions,
} from './interpretability-admin.helpers.js'
import { evaluateInterpretabilityRollout } from './interpretability-rollout.helpers.js'
import { InterpretabilityStatusService } from './interpretability-status.service.js'

@Injectable()
export class InterpretabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly interpretabilityStatusService: InterpretabilityStatusService,
  ) {}

  getCapabilities() {
    return interpretabilityCapabilitiesResponseSchema.parse({
      supportsInterpretabilityRollout: true,
      supportsInterpretabilityAdminTools: true,
      supportsAgentOutputInterpretabilitySignals: true,
      supportsSynthesisInterpretabilitySignals: true,
      guidance: getInterpretabilityRolloutGuidance(),
    })
  }

  async getInterpretabilityRollout() {
    const interpretabilityTableCoverage =
      await this.interpretabilityStatusService.getInterpretabilityTableCoverage()

    const rollout = evaluateInterpretabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.interpretabilityStatusService.pingPostgres(),
      existingInterpretabilityTableCount: interpretabilityTableCoverage.existingInterpretabilityTableCount,
      agentOutputsTableExists: interpretabilityTableCoverage.agentOutputsTableExists,
      moderatorSynthesesTableExists: interpretabilityTableCoverage.moderatorSynthesesTableExists,
      artifactsTableExists: interpretabilityTableCoverage.artifactsTableExists,
    })

    return interpretabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceInterpretabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageInterpretability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.interpretabilityStatusService.getWorkspaceInterpretabilityInventory(
        workspaceId,
      )
    const records = buildInterpretabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.interpretabilityStatusService.pingPostgres()
    const stats = buildInterpretabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return interpretabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveInterpretabilityAdminActions(),
      guidance: getInterpretabilityAdminGuidance({ stats }),
    })
  }

  async executeInterpretabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_interpretability_summary'
    },
  ) {
    this.assertCanManageInterpretability(authContext)

    const payload = interpretabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_interpretability_summary': {
        const summary = await this.getWorkspaceInterpretabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return interpretabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed interpretability summary with ${summary.stats.interpretabilityPercent}% agent output interpretability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageInterpretability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production interpretability tools.',
    })
  }
}
