import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getProgressiveizabilityRolloutGuidance,
  progressiveizabilityAdminActionRequestSchema,
  progressiveizabilityAdminActionResponseSchema,
  progressiveizabilityAdminSummaryResponseSchema,
  progressiveizabilityCapabilitiesResponseSchema,
  progressiveizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildProgressiveizabilityAdminRecords,
  buildProgressiveizabilityAdminStats,
  getProgressiveizabilityAdminGuidance,
  resolveProgressiveizabilityAdminActions,
} from './progressiveizability-admin.helpers.js'
import { evaluateProgressiveizabilityRollout } from './progressiveizability-rollout.helpers.js'
import { ProgressiveizabilityStatusService } from './progressiveizability-status.service.js'

@Injectable()
export class ProgressiveizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly progressiveizabilityStatusService: ProgressiveizabilityStatusService,
  ) {}

  getCapabilities() {
    return progressiveizabilityCapabilitiesResponseSchema.parse({
      supportsProgressiveizabilityRollout: true,
      supportsProgressiveizabilityAdminTools: true,
      supportsProviderCredentialProgressiveizabilitySignals: true,
      supportsModelRegistryProgressiveizabilitySignals: true,
      guidance: getProgressiveizabilityRolloutGuidance(),
    })
  }

  async getProgressiveizabilityRollout() {
    const progressiveizabilityTableCoverage =
      await this.progressiveizabilityStatusService.getProgressiveizabilityTableCoverage()

    const rollout = evaluateProgressiveizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.progressiveizabilityStatusService.pingPostgres(),
      existingProgressiveizabilityTableCount: progressiveizabilityTableCoverage.existingProgressiveizabilityTableCount,
      workspaceProviderCredentialsTableExists: progressiveizabilityTableCoverage.workspaceProviderCredentialsTableExists,
      modelRegistryEntriesTableExists: progressiveizabilityTableCoverage.modelRegistryEntriesTableExists,
      billingWebhookEventsTableExists: progressiveizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return progressiveizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceProgressiveizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageProgressiveizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.progressiveizabilityStatusService.getWorkspaceProgressiveizabilityInventory(
        workspaceId,
      )
    const records = buildProgressiveizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.progressiveizabilityStatusService.pingPostgres()
    const stats = buildProgressiveizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return progressiveizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveProgressiveizabilityAdminActions(),
      guidance: getProgressiveizabilityAdminGuidance({ stats }),
    })
  }

  async executeProgressiveizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_progressiveizability_summary'
    },
  ) {
    this.assertCanManageProgressiveizability(authContext)

    const payload = progressiveizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_progressiveizability_summary': {
        const summary = await this.getWorkspaceProgressiveizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return progressiveizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed progressiveizability summary with ${summary.stats.progressiveizabilityPercent}% provider credential progressiveizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageProgressiveizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production progressiveizability tools.',
    })
  }
}
