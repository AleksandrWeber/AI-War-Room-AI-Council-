import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getPredictizabilityRolloutGuidance,
  predictizabilityAdminActionRequestSchema,
  predictizabilityAdminActionResponseSchema,
  predictizabilityAdminSummaryResponseSchema,
  predictizabilityCapabilitiesResponseSchema,
  predictizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildPredictizabilityAdminRecords,
  buildPredictizabilityAdminStats,
  getPredictizabilityAdminGuidance,
  resolvePredictizabilityAdminActions,
} from './predictizability-admin.helpers.js'
import { evaluatePredictizabilityRollout } from './predictizability-rollout.helpers.js'
import { PredictizabilityStatusService } from './predictizability-status.service.js'

@Injectable()
export class PredictizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly predictizabilityStatusService: PredictizabilityStatusService,
  ) {}

  getCapabilities() {
    return predictizabilityCapabilitiesResponseSchema.parse({
      supportsPredictizabilityRollout: true,
      supportsPredictizabilityAdminTools: true,
      supportsProviderCredentialPredictizabilitySignals: true,
      supportsModelRegistryPredictizabilitySignals: true,
      guidance: getPredictizabilityRolloutGuidance(),
    })
  }

  async getPredictizabilityRollout() {
    const predictizabilityTableCoverage =
      await this.predictizabilityStatusService.getPredictizabilityTableCoverage()

    const rollout = evaluatePredictizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.predictizabilityStatusService.pingPostgres(),
      existingPredictizabilityTableCount: predictizabilityTableCoverage.existingPredictizabilityTableCount,
      workspaceProviderCredentialsTableExists: predictizabilityTableCoverage.workspaceProviderCredentialsTableExists,
      modelRegistryEntriesTableExists: predictizabilityTableCoverage.modelRegistryEntriesTableExists,
      billingWebhookEventsTableExists: predictizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return predictizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspacePredictizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManagePredictizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.predictizabilityStatusService.getWorkspacePredictizabilityInventory(
        workspaceId,
      )
    const records = buildPredictizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.predictizabilityStatusService.pingPostgres()
    const stats = buildPredictizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return predictizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolvePredictizabilityAdminActions(),
      guidance: getPredictizabilityAdminGuidance({ stats }),
    })
  }

  async executePredictizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_predictizability_summary'
    },
  ) {
    this.assertCanManagePredictizability(authContext)

    const payload = predictizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_predictizability_summary': {
        const summary = await this.getWorkspacePredictizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return predictizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed predictizability summary with ${summary.stats.predictizabilityPercent}% provider credential predictizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManagePredictizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production predictizability tools.',
    })
  }
}
