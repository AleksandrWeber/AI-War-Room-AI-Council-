import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getPredictabilityvaultizabilityRolloutGuidance,
  predictabilityvaultizabilityAdminActionRequestSchema,
  predictabilityvaultizabilityAdminActionResponseSchema,
  predictabilityvaultizabilityAdminSummaryResponseSchema,
  predictabilityvaultizabilityCapabilitiesResponseSchema,
  predictabilityvaultizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildPredictabilityvaultizabilityAdminRecords,
  buildPredictabilityvaultizabilityAdminStats,
  getPredictabilityvaultizabilityAdminGuidance,
  resolvePredictabilityvaultizabilityAdminActions,
} from './predictabilityvaultizability-admin.helpers.js'
import { evaluatePredictabilityvaultizabilityRollout } from './predictabilityvaultizability-rollout.helpers.js'
import { PredictabilityvaultizabilityStatusService } from './predictabilityvaultizability-status.service.js'

@Injectable()
export class PredictabilityvaultizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly predictabilityvaultizabilityStatusService: PredictabilityvaultizabilityStatusService,
  ) {}

  getCapabilities() {
    return predictabilityvaultizabilityCapabilitiesResponseSchema.parse({
      supportsPredictabilityvaultizabilityRollout: true,
      supportsPredictabilityvaultizabilityAdminTools: true,
      supportsBillingNotificationPredictabilityvaultizabilitySignals: true,
      supportsBillingWebhookPredictabilityvaultizabilitySignals: true,
      guidance: getPredictabilityvaultizabilityRolloutGuidance(),
    })
  }

  async getPredictabilityvaultizabilityRollout() {
    const predictabilityvaultizabilityTableCoverage =
      await this.predictabilityvaultizabilityStatusService.getPredictabilityvaultizabilityTableCoverage()

    const rollout = evaluatePredictabilityvaultizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.predictabilityvaultizabilityStatusService.pingPostgres(),
      existingPredictabilityvaultizabilityTableCount: predictabilityvaultizabilityTableCoverage.existingPredictabilityvaultizabilityTableCount,
      billingNotificationsTableExists: predictabilityvaultizabilityTableCoverage.billingNotificationsTableExists,
      billingWebhookEventsTableExists: predictabilityvaultizabilityTableCoverage.billingWebhookEventsTableExists,
      usageEventsTableExists: predictabilityvaultizabilityTableCoverage.usageEventsTableExists,
    })

    return predictabilityvaultizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspacePredictabilityvaultizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManagePredictabilityvaultizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.predictabilityvaultizabilityStatusService.getWorkspacePredictabilityvaultizabilityInventory(
        workspaceId,
      )
    const records = buildPredictabilityvaultizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.predictabilityvaultizabilityStatusService.pingPostgres()
    const stats = buildPredictabilityvaultizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return predictabilityvaultizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolvePredictabilityvaultizabilityAdminActions(),
      guidance: getPredictabilityvaultizabilityAdminGuidance({ stats }),
    })
  }

  async executePredictabilityvaultizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_predictabilityvaultizability_summary'
    },
  ) {
    this.assertCanManagePredictabilityvaultizability(authContext)

    const payload = predictabilityvaultizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_predictabilityvaultizability_summary': {
        const summary = await this.getWorkspacePredictabilityvaultizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return predictabilityvaultizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed predictabilityvaultizability summary with ${summary.stats.predictabilityvaultizabilityPercent}% billing notification predictabilityvaultizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManagePredictabilityvaultizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production predictabilityvaultizability tools.',
    })
  }
}
