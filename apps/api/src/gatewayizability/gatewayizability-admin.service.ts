import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getGatewayizabilityRolloutGuidance,
  gatewayizabilityAdminActionRequestSchema,
  gatewayizabilityAdminActionResponseSchema,
  gatewayizabilityAdminSummaryResponseSchema,
  gatewayizabilityCapabilitiesResponseSchema,
  gatewayizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildGatewayizabilityAdminRecords,
  buildGatewayizabilityAdminStats,
  getGatewayizabilityAdminGuidance,
  resolveGatewayizabilityAdminActions,
} from './gatewayizability-admin.helpers.js'
import { evaluateGatewayizabilityRollout } from './gatewayizability-rollout.helpers.js'
import { GatewayizabilityStatusService } from './gatewayizability-status.service.js'

@Injectable()
export class GatewayizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly gatewayizabilityStatusService: GatewayizabilityStatusService,
  ) {}

  getCapabilities() {
    return gatewayizabilityCapabilitiesResponseSchema.parse({
      supportsGatewayizabilityRollout: true,
      supportsGatewayizabilityAdminTools: true,
      supportsWorkspaceLimitGatewayizabilitySignals: true,
      supportsUsageEventGatewayizabilitySignals: true,
      guidance: getGatewayizabilityRolloutGuidance(),
    })
  }

  async getGatewayizabilityRollout() {
    const gatewayizabilityTableCoverage =
      await this.gatewayizabilityStatusService.getGatewayizabilityTableCoverage()

    const rollout = evaluateGatewayizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.gatewayizabilityStatusService.pingPostgres(),
      existingGatewayizabilityTableCount: gatewayizabilityTableCoverage.existingGatewayizabilityTableCount,
      workspaceUsageLimitsTableExists: gatewayizabilityTableCoverage.workspaceUsageLimitsTableExists,
      usageEventsTableExists: gatewayizabilityTableCoverage.usageEventsTableExists,
      billingRecordsTableExists: gatewayizabilityTableCoverage.billingRecordsTableExists,
    })

    return gatewayizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceGatewayizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageGatewayizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.gatewayizabilityStatusService.getWorkspaceGatewayizabilityInventory(
        workspaceId,
      )
    const records = buildGatewayizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.gatewayizabilityStatusService.pingPostgres()
    const stats = buildGatewayizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return gatewayizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveGatewayizabilityAdminActions(),
      guidance: getGatewayizabilityAdminGuidance({ stats }),
    })
  }

  async executeGatewayizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_gatewayizability_summary'
    },
  ) {
    this.assertCanManageGatewayizability(authContext)

    const payload = gatewayizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_gatewayizability_summary': {
        const summary = await this.getWorkspaceGatewayizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return gatewayizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed gatewayizability summary with ${summary.stats.gatewayizabilityPercent}% workspace limit gatewayizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageGatewayizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production gatewayizability tools.',
    })
  }
}
