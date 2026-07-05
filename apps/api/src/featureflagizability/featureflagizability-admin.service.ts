import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getFeatureflagizabilityRolloutGuidance,
  featureflagizabilityAdminActionRequestSchema,
  featureflagizabilityAdminActionResponseSchema,
  featureflagizabilityAdminSummaryResponseSchema,
  featureflagizabilityCapabilitiesResponseSchema,
  featureflagizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildFeatureflagizabilityAdminRecords,
  buildFeatureflagizabilityAdminStats,
  getFeatureflagizabilityAdminGuidance,
  resolveFeatureflagizabilityAdminActions,
} from './featureflagizability-admin.helpers.js'
import { evaluateFeatureflagizabilityRollout } from './featureflagizability-rollout.helpers.js'
import { FeatureflagizabilityStatusService } from './featureflagizability-status.service.js'

@Injectable()
export class FeatureflagizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly featureflagizabilityStatusService: FeatureflagizabilityStatusService,
  ) {}

  getCapabilities() {
    return featureflagizabilityCapabilitiesResponseSchema.parse({
      supportsFeatureflagizabilityRollout: true,
      supportsFeatureflagizabilityAdminTools: true,
      supportsModelHealthFeatureflagizabilitySignals: true,
      supportsModelRegistryFeatureflagizabilitySignals: true,
      guidance: getFeatureflagizabilityRolloutGuidance(),
    })
  }

  async getFeatureflagizabilityRollout() {
    const featureflagizabilityTableCoverage =
      await this.featureflagizabilityStatusService.getFeatureflagizabilityTableCoverage()

    const rollout = evaluateFeatureflagizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.featureflagizabilityStatusService.pingPostgres(),
      existingFeatureflagizabilityTableCount: featureflagizabilityTableCoverage.existingFeatureflagizabilityTableCount,
      modelHealthEventsTableExists: featureflagizabilityTableCoverage.modelHealthEventsTableExists,
      modelRegistryEntriesTableExists: featureflagizabilityTableCoverage.modelRegistryEntriesTableExists,
      billingRecordsTableExists: featureflagizabilityTableCoverage.billingRecordsTableExists,
    })

    return featureflagizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceFeatureflagizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageFeatureflagizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.featureflagizabilityStatusService.getWorkspaceFeatureflagizabilityInventory(
        workspaceId,
      )
    const records = buildFeatureflagizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.featureflagizabilityStatusService.pingPostgres()
    const stats = buildFeatureflagizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return featureflagizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveFeatureflagizabilityAdminActions(),
      guidance: getFeatureflagizabilityAdminGuidance({ stats }),
    })
  }

  async executeFeatureflagizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_featureflagizability_summary'
    },
  ) {
    this.assertCanManageFeatureflagizability(authContext)

    const payload = featureflagizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_featureflagizability_summary': {
        const summary = await this.getWorkspaceFeatureflagizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return featureflagizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed featureflagizability summary with ${summary.stats.featureflagizabilityPercent}% model health featureflagizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageFeatureflagizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production featureflagizability tools.',
    })
  }
}
