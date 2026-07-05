import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getHistorizabilityRolloutGuidance,
  historizabilityAdminActionRequestSchema,
  historizabilityAdminActionResponseSchema,
  historizabilityAdminSummaryResponseSchema,
  historizabilityCapabilitiesResponseSchema,
  historizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildHistorizabilityAdminRecords,
  buildHistorizabilityAdminStats,
  getHistorizabilityAdminGuidance,
  resolveHistorizabilityAdminActions,
} from './historizability-admin.helpers.js'
import { evaluateHistorizabilityRollout } from './historizability-rollout.helpers.js'
import { HistorizabilityStatusService } from './historizability-status.service.js'

@Injectable()
export class HistorizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly historizabilityStatusService: HistorizabilityStatusService,
  ) {}

  getCapabilities() {
    return historizabilityCapabilitiesResponseSchema.parse({
      supportsHistorizabilityRollout: true,
      supportsHistorizabilityAdminTools: true,
      supportsProviderCredentialHistorizabilitySignals: true,
      supportsModelRegistryHistorizabilitySignals: true,
      guidance: getHistorizabilityRolloutGuidance(),
    })
  }

  async getHistorizabilityRollout() {
    const historizabilityTableCoverage =
      await this.historizabilityStatusService.getHistorizabilityTableCoverage()

    const rollout = evaluateHistorizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.historizabilityStatusService.pingPostgres(),
      existingHistorizabilityTableCount: historizabilityTableCoverage.existingHistorizabilityTableCount,
      workspaceProviderCredentialsTableExists: historizabilityTableCoverage.workspaceProviderCredentialsTableExists,
      modelRegistryEntriesTableExists: historizabilityTableCoverage.modelRegistryEntriesTableExists,
      billingWebhookEventsTableExists: historizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return historizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceHistorizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageHistorizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.historizabilityStatusService.getWorkspaceHistorizabilityInventory(
        workspaceId,
      )
    const records = buildHistorizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.historizabilityStatusService.pingPostgres()
    const stats = buildHistorizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return historizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveHistorizabilityAdminActions(),
      guidance: getHistorizabilityAdminGuidance({ stats }),
    })
  }

  async executeHistorizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_historizability_summary'
    },
  ) {
    this.assertCanManageHistorizability(authContext)

    const payload = historizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_historizability_summary': {
        const summary = await this.getWorkspaceHistorizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return historizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed historizability summary with ${summary.stats.historizabilityPercent}% provider credential historizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageHistorizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production historizability tools.',
    })
  }
}
