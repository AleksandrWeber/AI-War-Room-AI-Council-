import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getPortabilityvaultizabilityRolloutGuidance,
  portabilityvaultizabilityAdminActionRequestSchema,
  portabilityvaultizabilityAdminActionResponseSchema,
  portabilityvaultizabilityAdminSummaryResponseSchema,
  portabilityvaultizabilityCapabilitiesResponseSchema,
  portabilityvaultizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildPortabilityvaultizabilityAdminRecords,
  buildPortabilityvaultizabilityAdminStats,
  getPortabilityvaultizabilityAdminGuidance,
  resolvePortabilityvaultizabilityAdminActions,
} from './portabilityvaultizability-admin.helpers.js'
import { evaluatePortabilityvaultizabilityRollout } from './portabilityvaultizability-rollout.helpers.js'
import { PortabilityvaultizabilityStatusService } from './portabilityvaultizability-status.service.js'

@Injectable()
export class PortabilityvaultizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly portabilityvaultizabilityStatusService: PortabilityvaultizabilityStatusService,
  ) {}

  getCapabilities() {
    return portabilityvaultizabilityCapabilitiesResponseSchema.parse({
      supportsPortabilityvaultizabilityRollout: true,
      supportsPortabilityvaultizabilityAdminTools: true,
      supportsBillingNotificationPortabilityvaultizabilitySignals: true,
      supportsBillingWebhookPortabilityvaultizabilitySignals: true,
      guidance: getPortabilityvaultizabilityRolloutGuidance(),
    })
  }

  async getPortabilityvaultizabilityRollout() {
    const portabilityvaultizabilityTableCoverage =
      await this.portabilityvaultizabilityStatusService.getPortabilityvaultizabilityTableCoverage()

    const rollout = evaluatePortabilityvaultizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.portabilityvaultizabilityStatusService.pingPostgres(),
      existingPortabilityvaultizabilityTableCount: portabilityvaultizabilityTableCoverage.existingPortabilityvaultizabilityTableCount,
      billingNotificationsTableExists: portabilityvaultizabilityTableCoverage.billingNotificationsTableExists,
      billingWebhookEventsTableExists: portabilityvaultizabilityTableCoverage.billingWebhookEventsTableExists,
      usageEventsTableExists: portabilityvaultizabilityTableCoverage.usageEventsTableExists,
    })

    return portabilityvaultizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspacePortabilityvaultizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManagePortabilityvaultizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.portabilityvaultizabilityStatusService.getWorkspacePortabilityvaultizabilityInventory(
        workspaceId,
      )
    const records = buildPortabilityvaultizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.portabilityvaultizabilityStatusService.pingPostgres()
    const stats = buildPortabilityvaultizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return portabilityvaultizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolvePortabilityvaultizabilityAdminActions(),
      guidance: getPortabilityvaultizabilityAdminGuidance({ stats }),
    })
  }

  async executePortabilityvaultizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_portabilityvaultizability_summary'
    },
  ) {
    this.assertCanManagePortabilityvaultizability(authContext)

    const payload = portabilityvaultizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_portabilityvaultizability_summary': {
        const summary = await this.getWorkspacePortabilityvaultizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return portabilityvaultizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed portabilityvaultizability summary with ${summary.stats.portabilityvaultizabilityPercent}% billing notification portabilityvaultizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManagePortabilityvaultizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production portabilityvaultizability tools.',
    })
  }
}
