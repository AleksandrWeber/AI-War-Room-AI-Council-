import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getConnectabilizabilityRolloutGuidance,
  connectabilizabilityAdminActionRequestSchema,
  connectabilizabilityAdminActionResponseSchema,
  connectabilizabilityAdminSummaryResponseSchema,
  connectabilizabilityCapabilitiesResponseSchema,
  connectabilizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildConnectabilizabilityAdminRecords,
  buildConnectabilizabilityAdminStats,
  getConnectabilizabilityAdminGuidance,
  resolveConnectabilizabilityAdminActions,
} from './connectabilizability-admin.helpers.js'
import { evaluateConnectabilizabilityRollout } from './connectabilizability-rollout.helpers.js'
import { ConnectabilizabilityStatusService } from './connectabilizability-status.service.js'

@Injectable()
export class ConnectabilizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly connectabilizabilityStatusService: ConnectabilizabilityStatusService,
  ) {}

  getCapabilities() {
    return connectabilizabilityCapabilitiesResponseSchema.parse({
      supportsConnectabilizabilityRollout: true,
      supportsConnectabilizabilityAdminTools: true,
      supportsWorkspaceLimitConnectabilizabilitySignals: true,
      supportsUsageEventConnectabilizabilitySignals: true,
      guidance: getConnectabilizabilityRolloutGuidance(),
    })
  }

  async getConnectabilizabilityRollout() {
    const connectabilizabilityTableCoverage =
      await this.connectabilizabilityStatusService.getConnectabilizabilityTableCoverage()

    const rollout = evaluateConnectabilizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.connectabilizabilityStatusService.pingPostgres(),
      existingConnectabilizabilityTableCount: connectabilizabilityTableCoverage.existingConnectabilizabilityTableCount,
      workspaceUsageLimitsTableExists: connectabilizabilityTableCoverage.workspaceUsageLimitsTableExists,
      usageEventsTableExists: connectabilizabilityTableCoverage.usageEventsTableExists,
      billingRecordsTableExists: connectabilizabilityTableCoverage.billingRecordsTableExists,
    })

    return connectabilizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceConnectabilizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageConnectabilizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.connectabilizabilityStatusService.getWorkspaceConnectabilizabilityInventory(
        workspaceId,
      )
    const records = buildConnectabilizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.connectabilizabilityStatusService.pingPostgres()
    const stats = buildConnectabilizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return connectabilizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveConnectabilizabilityAdminActions(),
      guidance: getConnectabilizabilityAdminGuidance({ stats }),
    })
  }

  async executeConnectabilizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_connectabilizability_summary'
    },
  ) {
    this.assertCanManageConnectabilizability(authContext)

    const payload = connectabilizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_connectabilizability_summary': {
        const summary = await this.getWorkspaceConnectabilizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return connectabilizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed connectabilizability summary with ${summary.stats.connectabilizabilityPercent}% workspace limit connectabilizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageConnectabilizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production connectabilizability tools.',
    })
  }
}
