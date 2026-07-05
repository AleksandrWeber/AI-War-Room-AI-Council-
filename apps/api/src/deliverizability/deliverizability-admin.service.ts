import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getDeliverizabilityRolloutGuidance,
  deliverizabilityAdminActionRequestSchema,
  deliverizabilityAdminActionResponseSchema,
  deliverizabilityAdminSummaryResponseSchema,
  deliverizabilityCapabilitiesResponseSchema,
  deliverizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildDeliverizabilityAdminRecords,
  buildDeliverizabilityAdminStats,
  getDeliverizabilityAdminGuidance,
  resolveDeliverizabilityAdminActions,
} from './deliverizability-admin.helpers.js'
import { evaluateDeliverizabilityRollout } from './deliverizability-rollout.helpers.js'
import { DeliverizabilityStatusService } from './deliverizability-status.service.js'

@Injectable()
export class DeliverizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly deliverizabilityStatusService: DeliverizabilityStatusService,
  ) {}

  getCapabilities() {
    return deliverizabilityCapabilitiesResponseSchema.parse({
      supportsDeliverizabilityRollout: true,
      supportsDeliverizabilityAdminTools: true,
      supportsProviderCredentialDeliverizabilitySignals: true,
      supportsModelRegistryDeliverizabilitySignals: true,
      guidance: getDeliverizabilityRolloutGuidance(),
    })
  }

  async getDeliverizabilityRollout() {
    const deliverizabilityTableCoverage =
      await this.deliverizabilityStatusService.getDeliverizabilityTableCoverage()

    const rollout = evaluateDeliverizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.deliverizabilityStatusService.pingPostgres(),
      existingDeliverizabilityTableCount: deliverizabilityTableCoverage.existingDeliverizabilityTableCount,
      workspaceProviderCredentialsTableExists: deliverizabilityTableCoverage.workspaceProviderCredentialsTableExists,
      modelRegistryEntriesTableExists: deliverizabilityTableCoverage.modelRegistryEntriesTableExists,
      billingWebhookEventsTableExists: deliverizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return deliverizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceDeliverizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageDeliverizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.deliverizabilityStatusService.getWorkspaceDeliverizabilityInventory(
        workspaceId,
      )
    const records = buildDeliverizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.deliverizabilityStatusService.pingPostgres()
    const stats = buildDeliverizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return deliverizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveDeliverizabilityAdminActions(),
      guidance: getDeliverizabilityAdminGuidance({ stats }),
    })
  }

  async executeDeliverizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_deliverizability_summary'
    },
  ) {
    this.assertCanManageDeliverizability(authContext)

    const payload = deliverizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_deliverizability_summary': {
        const summary = await this.getWorkspaceDeliverizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return deliverizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed deliverizability summary with ${summary.stats.deliverizabilityPercent}% provider credential deliverizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageDeliverizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production deliverizability tools.',
    })
  }
}
