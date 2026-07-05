import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getConfigurabilizabilityRolloutGuidance,
  configurabilizabilityAdminActionRequestSchema,
  configurabilizabilityAdminActionResponseSchema,
  configurabilizabilityAdminSummaryResponseSchema,
  configurabilizabilityCapabilitiesResponseSchema,
  configurabilizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildConfigurabilizabilityAdminRecords,
  buildConfigurabilizabilityAdminStats,
  getConfigurabilizabilityAdminGuidance,
  resolveConfigurabilizabilityAdminActions,
} from './configurabilizability-admin.helpers.js'
import { evaluateConfigurabilizabilityRollout } from './configurabilizability-rollout.helpers.js'
import { ConfigurabilizabilityStatusService } from './configurabilizability-status.service.js'

@Injectable()
export class ConfigurabilizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly configurabilizabilityStatusService: ConfigurabilizabilityStatusService,
  ) {}

  getCapabilities() {
    return configurabilizabilityCapabilitiesResponseSchema.parse({
      supportsConfigurabilizabilityRollout: true,
      supportsConfigurabilizabilityAdminTools: true,
      supportsShieldScanConfigurabilizabilitySignals: true,
      supportsProviderCredentialConfigurabilizabilitySignals: true,
      guidance: getConfigurabilizabilityRolloutGuidance(),
    })
  }

  async getConfigurabilizabilityRollout() {
    const configurabilizabilityTableCoverage =
      await this.configurabilizabilityStatusService.getConfigurabilizabilityTableCoverage()

    const rollout = evaluateConfigurabilizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.configurabilizabilityStatusService.pingPostgres(),
      existingConfigurabilizabilityTableCount: configurabilizabilityTableCoverage.existingConfigurabilizabilityTableCount,
      shieldScansTableExists: configurabilizabilityTableCoverage.shieldScansTableExists,
      workspaceProviderCredentialsTableExists: configurabilizabilityTableCoverage.workspaceProviderCredentialsTableExists,
      billingWebhookEventsTableExists: configurabilizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return configurabilizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceConfigurabilizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageConfigurabilizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.configurabilizabilityStatusService.getWorkspaceConfigurabilizabilityInventory(
        workspaceId,
      )
    const records = buildConfigurabilizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.configurabilizabilityStatusService.pingPostgres()
    const stats = buildConfigurabilizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return configurabilizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveConfigurabilizabilityAdminActions(),
      guidance: getConfigurabilizabilityAdminGuidance({ stats }),
    })
  }

  async executeConfigurabilizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_configurabilizability_summary'
    },
  ) {
    this.assertCanManageConfigurabilizability(authContext)

    const payload = configurabilizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_configurabilizability_summary': {
        const summary = await this.getWorkspaceConfigurabilizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return configurabilizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed configurabilizability summary with ${summary.stats.configurabilizabilityPercent}% shield scan configurabilizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageConfigurabilizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production configurabilizability tools.',
    })
  }
}
