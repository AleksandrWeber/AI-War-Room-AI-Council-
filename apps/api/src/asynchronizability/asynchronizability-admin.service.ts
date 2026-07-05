import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getAsynchronizabilityRolloutGuidance,
  asynchronizabilityAdminActionRequestSchema,
  asynchronizabilityAdminActionResponseSchema,
  asynchronizabilityAdminSummaryResponseSchema,
  asynchronizabilityCapabilitiesResponseSchema,
  asynchronizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildAsynchronizabilityAdminRecords,
  buildAsynchronizabilityAdminStats,
  getAsynchronizabilityAdminGuidance,
  resolveAsynchronizabilityAdminActions,
} from './asynchronizability-admin.helpers.js'
import { evaluateAsynchronizabilityRollout } from './asynchronizability-rollout.helpers.js'
import { AsynchronizabilityStatusService } from './asynchronizability-status.service.js'

@Injectable()
export class AsynchronizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly asynchronizabilityStatusService: AsynchronizabilityStatusService,
  ) {}

  getCapabilities() {
    return asynchronizabilityCapabilitiesResponseSchema.parse({
      supportsAsynchronizabilityRollout: true,
      supportsAsynchronizabilityAdminTools: true,
      supportsMembershipAsynchronizabilitySignals: true,
      supportsUsageEventAsynchronizabilitySignals: true,
      guidance: getAsynchronizabilityRolloutGuidance(),
    })
  }

  async getAsynchronizabilityRollout() {
    const asynchronizabilityTableCoverage =
      await this.asynchronizabilityStatusService.getAsynchronizabilityTableCoverage()

    const rollout = evaluateAsynchronizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.asynchronizabilityStatusService.pingPostgres(),
      existingAsynchronizabilityTableCount: asynchronizabilityTableCoverage.existingAsynchronizabilityTableCount,
      workspaceMembershipsTableExists: asynchronizabilityTableCoverage.workspaceMembershipsTableExists,
      usageEventsTableExists: asynchronizabilityTableCoverage.usageEventsTableExists,
      billingNotificationsTableExists: asynchronizabilityTableCoverage.billingNotificationsTableExists,
    })

    return asynchronizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceAsynchronizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageAsynchronizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.asynchronizabilityStatusService.getWorkspaceAsynchronizabilityInventory(
        workspaceId,
      )
    const records = buildAsynchronizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.asynchronizabilityStatusService.pingPostgres()
    const stats = buildAsynchronizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return asynchronizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveAsynchronizabilityAdminActions(),
      guidance: getAsynchronizabilityAdminGuidance({ stats }),
    })
  }

  async executeAsynchronizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_asynchronizability_summary'
    },
  ) {
    this.assertCanManageAsynchronizability(authContext)

    const payload = asynchronizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_asynchronizability_summary': {
        const summary = await this.getWorkspaceAsynchronizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return asynchronizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed asynchronizability summary with ${summary.stats.asynchronizabilityPercent}% membership asynchronizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageAsynchronizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production asynchronizability tools.',
    })
  }
}
