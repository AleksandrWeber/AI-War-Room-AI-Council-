import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getEvictionizabilityRolloutGuidance,
  evictionizabilityAdminActionRequestSchema,
  evictionizabilityAdminActionResponseSchema,
  evictionizabilityAdminSummaryResponseSchema,
  evictionizabilityCapabilitiesResponseSchema,
  evictionizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildEvictionizabilityAdminRecords,
  buildEvictionizabilityAdminStats,
  getEvictionizabilityAdminGuidance,
  resolveEvictionizabilityAdminActions,
} from './evictionizability-admin.helpers.js'
import { evaluateEvictionizabilityRollout } from './evictionizability-rollout.helpers.js'
import { EvictionizabilityStatusService } from './evictionizability-status.service.js'

@Injectable()
export class EvictionizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly evictionizabilityStatusService: EvictionizabilityStatusService,
  ) {}

  getCapabilities() {
    return evictionizabilityCapabilitiesResponseSchema.parse({
      supportsEvictionizabilityRollout: true,
      supportsEvictionizabilityAdminTools: true,
      supportsMembershipEvictionizabilitySignals: true,
      supportsUsageEventEvictionizabilitySignals: true,
      guidance: getEvictionizabilityRolloutGuidance(),
    })
  }

  async getEvictionizabilityRollout() {
    const evictionizabilityTableCoverage =
      await this.evictionizabilityStatusService.getEvictionizabilityTableCoverage()

    const rollout = evaluateEvictionizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.evictionizabilityStatusService.pingPostgres(),
      existingEvictionizabilityTableCount: evictionizabilityTableCoverage.existingEvictionizabilityTableCount,
      workspaceMembershipsTableExists: evictionizabilityTableCoverage.workspaceMembershipsTableExists,
      usageEventsTableExists: evictionizabilityTableCoverage.usageEventsTableExists,
      billingNotificationsTableExists: evictionizabilityTableCoverage.billingNotificationsTableExists,
    })

    return evictionizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceEvictionizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageEvictionizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.evictionizabilityStatusService.getWorkspaceEvictionizabilityInventory(
        workspaceId,
      )
    const records = buildEvictionizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.evictionizabilityStatusService.pingPostgres()
    const stats = buildEvictionizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return evictionizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveEvictionizabilityAdminActions(),
      guidance: getEvictionizabilityAdminGuidance({ stats }),
    })
  }

  async executeEvictionizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_evictionizability_summary'
    },
  ) {
    this.assertCanManageEvictionizability(authContext)

    const payload = evictionizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_evictionizability_summary': {
        const summary = await this.getWorkspaceEvictionizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return evictionizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed evictionizability summary with ${summary.stats.evictionizabilityPercent}% membership evictionizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageEvictionizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production evictionizability tools.',
    })
  }
}
