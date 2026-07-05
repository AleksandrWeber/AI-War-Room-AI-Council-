import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getIconizabilityRolloutGuidance,
  iconizabilityAdminActionRequestSchema,
  iconizabilityAdminActionResponseSchema,
  iconizabilityAdminSummaryResponseSchema,
  iconizabilityCapabilitiesResponseSchema,
  iconizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildIconizabilityAdminRecords,
  buildIconizabilityAdminStats,
  getIconizabilityAdminGuidance,
  resolveIconizabilityAdminActions,
} from './iconizability-admin.helpers.js'
import { evaluateIconizabilityRollout } from './iconizability-rollout.helpers.js'
import { IconizabilityStatusService } from './iconizability-status.service.js'

@Injectable()
export class IconizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly iconizabilityStatusService: IconizabilityStatusService,
  ) {}

  getCapabilities() {
    return iconizabilityCapabilitiesResponseSchema.parse({
      supportsIconizabilityRollout: true,
      supportsIconizabilityAdminTools: true,
      supportsShieldScanIconizabilitySignals: true,
      supportsProviderCredentialIconizabilitySignals: true,
      guidance: getIconizabilityRolloutGuidance(),
    })
  }

  async getIconizabilityRollout() {
    const iconizabilityTableCoverage =
      await this.iconizabilityStatusService.getIconizabilityTableCoverage()

    const rollout = evaluateIconizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.iconizabilityStatusService.pingPostgres(),
      existingIconizabilityTableCount: iconizabilityTableCoverage.existingIconizabilityTableCount,
      shieldScansTableExists: iconizabilityTableCoverage.shieldScansTableExists,
      workspaceProviderCredentialsTableExists: iconizabilityTableCoverage.workspaceProviderCredentialsTableExists,
      billingWebhookEventsTableExists: iconizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return iconizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceIconizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageIconizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.iconizabilityStatusService.getWorkspaceIconizabilityInventory(
        workspaceId,
      )
    const records = buildIconizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.iconizabilityStatusService.pingPostgres()
    const stats = buildIconizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return iconizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveIconizabilityAdminActions(),
      guidance: getIconizabilityAdminGuidance({ stats }),
    })
  }

  async executeIconizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_iconizability_summary'
    },
  ) {
    this.assertCanManageIconizability(authContext)

    const payload = iconizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_iconizability_summary': {
        const summary = await this.getWorkspaceIconizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return iconizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed iconizability summary with ${summary.stats.iconizabilityPercent}% shield scan iconizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageIconizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production iconizability tools.',
    })
  }
}
