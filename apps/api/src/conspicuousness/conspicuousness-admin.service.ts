import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getConspicuousnessRolloutGuidance,
  conspicuousnessAdminActionRequestSchema,
  conspicuousnessAdminActionResponseSchema,
  conspicuousnessAdminSummaryResponseSchema,
  conspicuousnessCapabilitiesResponseSchema,
  conspicuousnessRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildConspicuousnessAdminRecords,
  buildConspicuousnessAdminStats,
  getConspicuousnessAdminGuidance,
  resolveConspicuousnessAdminActions,
} from './conspicuousness-admin.helpers.js'
import { evaluateConspicuousnessRollout } from './conspicuousness-rollout.helpers.js'
import { ConspicuousnessStatusService } from './conspicuousness-status.service.js'

@Injectable()
export class ConspicuousnessAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly conspicuousnessStatusService: ConspicuousnessStatusService,
  ) {}

  getCapabilities() {
    return conspicuousnessCapabilitiesResponseSchema.parse({
      supportsConspicuousnessRollout: true,
      supportsConspicuousnessAdminTools: true,
      supportsMembershipConspicuousnessSignals: true,
      supportsUsageEventConspicuousnessSignals: true,
      guidance: getConspicuousnessRolloutGuidance(),
    })
  }

  async getConspicuousnessRollout() {
    const conspicuousnessTableCoverage =
      await this.conspicuousnessStatusService.getConspicuousnessTableCoverage()

    const rollout = evaluateConspicuousnessRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.conspicuousnessStatusService.pingPostgres(),
      existingConspicuousnessTableCount: conspicuousnessTableCoverage.existingConspicuousnessTableCount,
      workspaceMembershipsTableExists: conspicuousnessTableCoverage.workspaceMembershipsTableExists,
      usageEventsTableExists: conspicuousnessTableCoverage.usageEventsTableExists,
      billingNotificationsTableExists: conspicuousnessTableCoverage.billingNotificationsTableExists,
    })

    return conspicuousnessRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceConspicuousnessAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageConspicuousness(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.conspicuousnessStatusService.getWorkspaceConspicuousnessInventory(
        workspaceId,
      )
    const records = buildConspicuousnessAdminRecords(inventoryItems)
    const postgresConnectivity = await this.conspicuousnessStatusService.pingPostgres()
    const stats = buildConspicuousnessAdminStats({
      records,
      postgresConnectivity,
    })

    return conspicuousnessAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveConspicuousnessAdminActions(),
      guidance: getConspicuousnessAdminGuidance({ stats }),
    })
  }

  async executeConspicuousnessAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_conspicuousness_summary'
    },
  ) {
    this.assertCanManageConspicuousness(authContext)

    const payload = conspicuousnessAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_conspicuousness_summary': {
        const summary = await this.getWorkspaceConspicuousnessAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return conspicuousnessAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed conspicuousness summary with ${summary.stats.conspicuousnessPercent}% membership conspicuousness across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageConspicuousness(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production conspicuousness tools.',
    })
  }
}
