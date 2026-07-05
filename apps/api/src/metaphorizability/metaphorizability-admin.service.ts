import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getMetaphorizabilityRolloutGuidance,
  metaphorizabilityAdminActionRequestSchema,
  metaphorizabilityAdminActionResponseSchema,
  metaphorizabilityAdminSummaryResponseSchema,
  metaphorizabilityCapabilitiesResponseSchema,
  metaphorizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildMetaphorizabilityAdminRecords,
  buildMetaphorizabilityAdminStats,
  getMetaphorizabilityAdminGuidance,
  resolveMetaphorizabilityAdminActions,
} from './metaphorizability-admin.helpers.js'
import { evaluateMetaphorizabilityRollout } from './metaphorizability-rollout.helpers.js'
import { MetaphorizabilityStatusService } from './metaphorizability-status.service.js'

@Injectable()
export class MetaphorizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly metaphorizabilityStatusService: MetaphorizabilityStatusService,
  ) {}

  getCapabilities() {
    return metaphorizabilityCapabilitiesResponseSchema.parse({
      supportsMetaphorizabilityRollout: true,
      supportsMetaphorizabilityAdminTools: true,
      supportsProviderCredentialMetaphorizabilitySignals: true,
      supportsModelRegistryMetaphorizabilitySignals: true,
      guidance: getMetaphorizabilityRolloutGuidance(),
    })
  }

  async getMetaphorizabilityRollout() {
    const metaphorizabilityTableCoverage =
      await this.metaphorizabilityStatusService.getMetaphorizabilityTableCoverage()

    const rollout = evaluateMetaphorizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.metaphorizabilityStatusService.pingPostgres(),
      existingMetaphorizabilityTableCount: metaphorizabilityTableCoverage.existingMetaphorizabilityTableCount,
      workspaceProviderCredentialsTableExists: metaphorizabilityTableCoverage.workspaceProviderCredentialsTableExists,
      modelRegistryEntriesTableExists: metaphorizabilityTableCoverage.modelRegistryEntriesTableExists,
      billingWebhookEventsTableExists: metaphorizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return metaphorizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceMetaphorizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageMetaphorizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.metaphorizabilityStatusService.getWorkspaceMetaphorizabilityInventory(
        workspaceId,
      )
    const records = buildMetaphorizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.metaphorizabilityStatusService.pingPostgres()
    const stats = buildMetaphorizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return metaphorizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveMetaphorizabilityAdminActions(),
      guidance: getMetaphorizabilityAdminGuidance({ stats }),
    })
  }

  async executeMetaphorizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_metaphorizability_summary'
    },
  ) {
    this.assertCanManageMetaphorizability(authContext)

    const payload = metaphorizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_metaphorizability_summary': {
        const summary = await this.getWorkspaceMetaphorizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return metaphorizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed metaphorizability summary with ${summary.stats.metaphorizabilityPercent}% provider credential metaphorizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageMetaphorizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production metaphorizability tools.',
    })
  }
}
