import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getConnectabilityRolloutGuidance,
  connectabilityAdminActionRequestSchema,
  connectabilityAdminActionResponseSchema,
  connectabilityAdminSummaryResponseSchema,
  connectabilityCapabilitiesResponseSchema,
  connectabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildConnectabilityAdminRecords,
  buildConnectabilityAdminStats,
  getConnectabilityAdminGuidance,
  resolveConnectabilityAdminActions,
} from './connectability-admin.helpers.js'
import { evaluateConnectabilityRollout } from './connectability-rollout.helpers.js'
import { ConnectabilityStatusService } from './connectability-status.service.js'

@Injectable()
export class ConnectabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly connectabilityStatusService: ConnectabilityStatusService,
  ) {}

  getCapabilities() {
    return connectabilityCapabilitiesResponseSchema.parse({
      supportsConnectabilityRollout: true,
      supportsConnectabilityAdminTools: true,
      supportsUsageEventConnectabilitySignals: true,
      supportsBillingWebhookConnectabilitySignals: true,
      guidance: getConnectabilityRolloutGuidance(),
    })
  }

  async getConnectabilityRollout() {
    const connectabilityTableCoverage =
      await this.connectabilityStatusService.getConnectabilityTableCoverage()

    const rollout = evaluateConnectabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.connectabilityStatusService.pingPostgres(),
      existingConnectabilityTableCount: connectabilityTableCoverage.existingConnectabilityTableCount,
      usageEventsTableExists: connectabilityTableCoverage.usageEventsTableExists,
      billingWebhookEventsTableExists: connectabilityTableCoverage.billingWebhookEventsTableExists,
      workspaceProviderCredentialsTableExists: connectabilityTableCoverage.workspaceProviderCredentialsTableExists,
    })

    return connectabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceConnectabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageConnectability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.connectabilityStatusService.getWorkspaceConnectabilityInventory(
        workspaceId,
      )
    const records = buildConnectabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.connectabilityStatusService.pingPostgres()
    const stats = buildConnectabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return connectabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveConnectabilityAdminActions(),
      guidance: getConnectabilityAdminGuidance({ stats }),
    })
  }

  async executeConnectabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_connectability_summary'
    },
  ) {
    this.assertCanManageConnectability(authContext)

    const payload = connectabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_connectability_summary': {
        const summary = await this.getWorkspaceConnectabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return connectabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed connectability summary with ${summary.stats.connectabilityPercent}% usage event connectability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageConnectability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production connectability tools.',
    })
  }
}
