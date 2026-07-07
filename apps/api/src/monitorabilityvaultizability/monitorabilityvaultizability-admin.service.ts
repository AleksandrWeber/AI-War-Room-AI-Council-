import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getMonitorabilityvaultizabilityRolloutGuidance,
  monitorabilityvaultizabilityAdminActionRequestSchema,
  monitorabilityvaultizabilityAdminActionResponseSchema,
  monitorabilityvaultizabilityAdminSummaryResponseSchema,
  monitorabilityvaultizabilityCapabilitiesResponseSchema,
  monitorabilityvaultizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildMonitorabilityvaultizabilityAdminRecords,
  buildMonitorabilityvaultizabilityAdminStats,
  getMonitorabilityvaultizabilityAdminGuidance,
  resolveMonitorabilityvaultizabilityAdminActions,
} from './monitorabilityvaultizability-admin.helpers.js'
import { evaluateMonitorabilityvaultizabilityRollout } from './monitorabilityvaultizability-rollout.helpers.js'
import { MonitorabilityvaultizabilityStatusService } from './monitorabilityvaultizability-status.service.js'

@Injectable()
export class MonitorabilityvaultizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly monitorabilityvaultizabilityStatusService: MonitorabilityvaultizabilityStatusService,
  ) {}

  getCapabilities() {
    return monitorabilityvaultizabilityCapabilitiesResponseSchema.parse({
      supportsMonitorabilityvaultizabilityRollout: true,
      supportsMonitorabilityvaultizabilityAdminTools: true,
      supportsShieldScanMonitorabilityvaultizabilitySignals: true,
      supportsProviderCredentialMonitorabilityvaultizabilitySignals: true,
      guidance: getMonitorabilityvaultizabilityRolloutGuidance(),
    })
  }

  async getMonitorabilityvaultizabilityRollout() {
    const monitorabilityvaultizabilityTableCoverage =
      await this.monitorabilityvaultizabilityStatusService.getMonitorabilityvaultizabilityTableCoverage()

    const rollout = evaluateMonitorabilityvaultizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.monitorabilityvaultizabilityStatusService.pingPostgres(),
      existingMonitorabilityvaultizabilityTableCount: monitorabilityvaultizabilityTableCoverage.existingMonitorabilityvaultizabilityTableCount,
      shieldScansTableExists: monitorabilityvaultizabilityTableCoverage.shieldScansTableExists,
      workspaceProviderCredentialsTableExists: monitorabilityvaultizabilityTableCoverage.workspaceProviderCredentialsTableExists,
      billingWebhookEventsTableExists: monitorabilityvaultizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return monitorabilityvaultizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceMonitorabilityvaultizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageMonitorabilityvaultizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.monitorabilityvaultizabilityStatusService.getWorkspaceMonitorabilityvaultizabilityInventory(
        workspaceId,
      )
    const records = buildMonitorabilityvaultizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.monitorabilityvaultizabilityStatusService.pingPostgres()
    const stats = buildMonitorabilityvaultizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return monitorabilityvaultizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveMonitorabilityvaultizabilityAdminActions(),
      guidance: getMonitorabilityvaultizabilityAdminGuidance({ stats }),
    })
  }

  async executeMonitorabilityvaultizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_monitorabilityvaultizability_summary'
    },
  ) {
    this.assertCanManageMonitorabilityvaultizability(authContext)

    const payload = monitorabilityvaultizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_monitorabilityvaultizability_summary': {
        const summary = await this.getWorkspaceMonitorabilityvaultizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return monitorabilityvaultizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed monitorabilityvaultizability summary with ${summary.stats.monitorabilityvaultizabilityPercent}% shield scan monitorabilityvaultizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageMonitorabilityvaultizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production monitorabilityvaultizability tools.',
    })
  }
}
