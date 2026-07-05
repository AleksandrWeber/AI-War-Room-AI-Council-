import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getPredictabilityRolloutGuidance,
  predictabilityAdminActionRequestSchema,
  predictabilityAdminActionResponseSchema,
  predictabilityAdminSummaryResponseSchema,
  predictabilityCapabilitiesResponseSchema,
  predictabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildPredictabilityAdminRecords,
  buildPredictabilityAdminStats,
  getPredictabilityAdminGuidance,
  resolvePredictabilityAdminActions,
} from './predictability-admin.helpers.js'
import { evaluatePredictabilityRollout } from './predictability-rollout.helpers.js'
import { PredictabilityStatusService } from './predictability-status.service.js'

@Injectable()
export class PredictabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly predictabilityStatusService: PredictabilityStatusService,
  ) {}

  getCapabilities() {
    return predictabilityCapabilitiesResponseSchema.parse({
      supportsPredictabilityRollout: true,
      supportsPredictabilityAdminTools: true,
      supportsSynthesisPredictabilitySignals: true,
      supportsAgentOutputPredictabilitySignals: true,
      guidance: getPredictabilityRolloutGuidance(),
    })
  }

  async getPredictabilityRollout() {
    const predictabilityTableCoverage =
      await this.predictabilityStatusService.getPredictabilityTableCoverage()

    const rollout = evaluatePredictabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.predictabilityStatusService.pingPostgres(),
      existingPredictabilityTableCount: predictabilityTableCoverage.existingPredictabilityTableCount,
      moderatorSynthesesTableExists: predictabilityTableCoverage.moderatorSynthesesTableExists,
      agentOutputsTableExists: predictabilityTableCoverage.agentOutputsTableExists,
      billingInvoicesTableExists: predictabilityTableCoverage.billingInvoicesTableExists,
    })

    return predictabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspacePredictabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManagePredictability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.predictabilityStatusService.getWorkspacePredictabilityInventory(
        workspaceId,
      )
    const records = buildPredictabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.predictabilityStatusService.pingPostgres()
    const stats = buildPredictabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return predictabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolvePredictabilityAdminActions(),
      guidance: getPredictabilityAdminGuidance({ stats }),
    })
  }

  async executePredictabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_predictability_summary'
    },
  ) {
    this.assertCanManagePredictability(authContext)

    const payload = predictabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_predictability_summary': {
        const summary = await this.getWorkspacePredictabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return predictabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed predictability summary with ${summary.stats.predictabilityPercent}% moderator synthesis predictability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManagePredictability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production predictability tools.',
    })
  }
}
