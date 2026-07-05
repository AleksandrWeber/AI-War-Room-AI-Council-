import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getConfigurabilityRolloutGuidance,
  configurabilityAdminActionRequestSchema,
  configurabilityAdminActionResponseSchema,
  configurabilityAdminSummaryResponseSchema,
  configurabilityCapabilitiesResponseSchema,
  configurabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildConfigurabilityAdminRecords,
  buildConfigurabilityAdminStats,
  getConfigurabilityAdminGuidance,
  resolveConfigurabilityAdminActions,
} from './configurability-admin.helpers.js'
import { evaluateConfigurabilityRollout } from './configurability-rollout.helpers.js'
import { ConfigurabilityStatusService } from './configurability-status.service.js'

@Injectable()
export class ConfigurabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly configurabilityStatusService: ConfigurabilityStatusService,
  ) {}

  getCapabilities() {
    return configurabilityCapabilitiesResponseSchema.parse({
      supportsConfigurabilityRollout: true,
      supportsConfigurabilityAdminTools: true,
      supportsProviderCredentialConfigurabilitySignals: true,
      supportsWorkspaceLimitConfigurabilitySignals: true,
      guidance: getConfigurabilityRolloutGuidance(),
    })
  }

  async getConfigurabilityRollout() {
    const configurabilityTableCoverage =
      await this.configurabilityStatusService.getConfigurabilityTableCoverage()

    const rollout = evaluateConfigurabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.configurabilityStatusService.pingPostgres(),
      existingConfigurabilityTableCount: configurabilityTableCoverage.existingConfigurabilityTableCount,
      workspaceProviderCredentialsTableExists: configurabilityTableCoverage.workspaceProviderCredentialsTableExists,
      workspaceUsageLimitsTableExists: configurabilityTableCoverage.workspaceUsageLimitsTableExists,
      billingMeterUsageReportsTableExists: configurabilityTableCoverage.billingMeterUsageReportsTableExists,
    })

    return configurabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceConfigurabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageConfigurability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.configurabilityStatusService.getWorkspaceConfigurabilityInventory(
        workspaceId,
      )
    const records = buildConfigurabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.configurabilityStatusService.pingPostgres()
    const stats = buildConfigurabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return configurabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveConfigurabilityAdminActions(),
      guidance: getConfigurabilityAdminGuidance({ stats }),
    })
  }

  async executeConfigurabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_configurability_summary'
    },
  ) {
    this.assertCanManageConfigurability(authContext)

    const payload = configurabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_configurability_summary': {
        const summary = await this.getWorkspaceConfigurabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return configurabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed configurability summary with ${summary.stats.configurabilityPercent}% provider credential configurability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageConfigurability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production configurability tools.',
    })
  }
}
