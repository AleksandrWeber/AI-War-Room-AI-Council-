import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getUpgradizabilityRolloutGuidance,
  upgradizabilityAdminActionRequestSchema,
  upgradizabilityAdminActionResponseSchema,
  upgradizabilityAdminSummaryResponseSchema,
  upgradizabilityCapabilitiesResponseSchema,
  upgradizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildUpgradizabilityAdminRecords,
  buildUpgradizabilityAdminStats,
  getUpgradizabilityAdminGuidance,
  resolveUpgradizabilityAdminActions,
} from './upgradizability-admin.helpers.js'
import { evaluateUpgradizabilityRollout } from './upgradizability-rollout.helpers.js'
import { UpgradizabilityStatusService } from './upgradizability-status.service.js'

@Injectable()
export class UpgradizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly upgradizabilityStatusService: UpgradizabilityStatusService,
  ) {}

  getCapabilities() {
    return upgradizabilityCapabilitiesResponseSchema.parse({
      supportsUpgradizabilityRollout: true,
      supportsUpgradizabilityAdminTools: true,
      supportsProviderCredentialUpgradizabilitySignals: true,
      supportsModelRegistryUpgradizabilitySignals: true,
      guidance: getUpgradizabilityRolloutGuidance(),
    })
  }

  async getUpgradizabilityRollout() {
    const upgradizabilityTableCoverage =
      await this.upgradizabilityStatusService.getUpgradizabilityTableCoverage()

    const rollout = evaluateUpgradizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.upgradizabilityStatusService.pingPostgres(),
      existingUpgradizabilityTableCount: upgradizabilityTableCoverage.existingUpgradizabilityTableCount,
      workspaceProviderCredentialsTableExists: upgradizabilityTableCoverage.workspaceProviderCredentialsTableExists,
      modelRegistryEntriesTableExists: upgradizabilityTableCoverage.modelRegistryEntriesTableExists,
      billingWebhookEventsTableExists: upgradizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return upgradizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceUpgradizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageUpgradizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.upgradizabilityStatusService.getWorkspaceUpgradizabilityInventory(
        workspaceId,
      )
    const records = buildUpgradizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.upgradizabilityStatusService.pingPostgres()
    const stats = buildUpgradizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return upgradizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveUpgradizabilityAdminActions(),
      guidance: getUpgradizabilityAdminGuidance({ stats }),
    })
  }

  async executeUpgradizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_upgradizability_summary'
    },
  ) {
    this.assertCanManageUpgradizability(authContext)

    const payload = upgradizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_upgradizability_summary': {
        const summary = await this.getWorkspaceUpgradizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return upgradizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed upgradizability summary with ${summary.stats.upgradizabilityPercent}% provider credential upgradizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageUpgradizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production upgradizability tools.',
    })
  }
}
