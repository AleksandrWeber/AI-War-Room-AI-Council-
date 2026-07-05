import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getAutoscalingizabilityRolloutGuidance,
  autoscalingizabilityAdminActionRequestSchema,
  autoscalingizabilityAdminActionResponseSchema,
  autoscalingizabilityAdminSummaryResponseSchema,
  autoscalingizabilityCapabilitiesResponseSchema,
  autoscalingizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildAutoscalingizabilityAdminRecords,
  buildAutoscalingizabilityAdminStats,
  getAutoscalingizabilityAdminGuidance,
  resolveAutoscalingizabilityAdminActions,
} from './autoscalingizability-admin.helpers.js'
import { evaluateAutoscalingizabilityRollout } from './autoscalingizability-rollout.helpers.js'
import { AutoscalingizabilityStatusService } from './autoscalingizability-status.service.js'

@Injectable()
export class AutoscalingizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly autoscalingizabilityStatusService: AutoscalingizabilityStatusService,
  ) {}

  getCapabilities() {
    return autoscalingizabilityCapabilitiesResponseSchema.parse({
      supportsAutoscalingizabilityRollout: true,
      supportsAutoscalingizabilityAdminTools: true,
      supportsProviderCredentialAutoscalingizabilitySignals: true,
      supportsModelRegistryAutoscalingizabilitySignals: true,
      guidance: getAutoscalingizabilityRolloutGuidance(),
    })
  }

  async getAutoscalingizabilityRollout() {
    const autoscalingizabilityTableCoverage =
      await this.autoscalingizabilityStatusService.getAutoscalingizabilityTableCoverage()

    const rollout = evaluateAutoscalingizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.autoscalingizabilityStatusService.pingPostgres(),
      existingAutoscalingizabilityTableCount: autoscalingizabilityTableCoverage.existingAutoscalingizabilityTableCount,
      workspaceProviderCredentialsTableExists: autoscalingizabilityTableCoverage.workspaceProviderCredentialsTableExists,
      modelRegistryEntriesTableExists: autoscalingizabilityTableCoverage.modelRegistryEntriesTableExists,
      billingWebhookEventsTableExists: autoscalingizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return autoscalingizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceAutoscalingizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageAutoscalingizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.autoscalingizabilityStatusService.getWorkspaceAutoscalingizabilityInventory(
        workspaceId,
      )
    const records = buildAutoscalingizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.autoscalingizabilityStatusService.pingPostgres()
    const stats = buildAutoscalingizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return autoscalingizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveAutoscalingizabilityAdminActions(),
      guidance: getAutoscalingizabilityAdminGuidance({ stats }),
    })
  }

  async executeAutoscalingizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_autoscalingizability_summary'
    },
  ) {
    this.assertCanManageAutoscalingizability(authContext)

    const payload = autoscalingizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_autoscalingizability_summary': {
        const summary = await this.getWorkspaceAutoscalingizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return autoscalingizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed autoscalingizability summary with ${summary.stats.autoscalingizabilityPercent}% provider credential autoscalingizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageAutoscalingizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production autoscalingizability tools.',
    })
  }
}
