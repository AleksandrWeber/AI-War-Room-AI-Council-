import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getEventizabilityRolloutGuidance,
  eventizabilityAdminActionRequestSchema,
  eventizabilityAdminActionResponseSchema,
  eventizabilityAdminSummaryResponseSchema,
  eventizabilityCapabilitiesResponseSchema,
  eventizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildEventizabilityAdminRecords,
  buildEventizabilityAdminStats,
  getEventizabilityAdminGuidance,
  resolveEventizabilityAdminActions,
} from './eventizability-admin.helpers.js'
import { evaluateEventizabilityRollout } from './eventizability-rollout.helpers.js'
import { EventizabilityStatusService } from './eventizability-status.service.js'

@Injectable()
export class EventizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly eventizabilityStatusService: EventizabilityStatusService,
  ) {}

  getCapabilities() {
    return eventizabilityCapabilitiesResponseSchema.parse({
      supportsEventizabilityRollout: true,
      supportsEventizabilityAdminTools: true,
      supportsMembershipEventizabilitySignals: true,
      supportsUsageEventEventizabilitySignals: true,
      guidance: getEventizabilityRolloutGuidance(),
    })
  }

  async getEventizabilityRollout() {
    const eventizabilityTableCoverage =
      await this.eventizabilityStatusService.getEventizabilityTableCoverage()

    const rollout = evaluateEventizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.eventizabilityStatusService.pingPostgres(),
      existingEventizabilityTableCount: eventizabilityTableCoverage.existingEventizabilityTableCount,
      workspaceMembershipsTableExists: eventizabilityTableCoverage.workspaceMembershipsTableExists,
      usageEventsTableExists: eventizabilityTableCoverage.usageEventsTableExists,
      billingNotificationsTableExists: eventizabilityTableCoverage.billingNotificationsTableExists,
    })

    return eventizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceEventizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageEventizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.eventizabilityStatusService.getWorkspaceEventizabilityInventory(
        workspaceId,
      )
    const records = buildEventizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.eventizabilityStatusService.pingPostgres()
    const stats = buildEventizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return eventizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveEventizabilityAdminActions(),
      guidance: getEventizabilityAdminGuidance({ stats }),
    })
  }

  async executeEventizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_eventizability_summary'
    },
  ) {
    this.assertCanManageEventizability(authContext)

    const payload = eventizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_eventizability_summary': {
        const summary = await this.getWorkspaceEventizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return eventizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed eventizability summary with ${summary.stats.eventizabilityPercent}% membership eventizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageEventizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production eventizability tools.',
    })
  }
}
