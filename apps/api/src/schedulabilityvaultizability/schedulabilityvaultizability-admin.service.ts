import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getSchedulabilityvaultizabilityRolloutGuidance,
  schedulabilityvaultizabilityAdminActionRequestSchema,
  schedulabilityvaultizabilityAdminActionResponseSchema,
  schedulabilityvaultizabilityAdminSummaryResponseSchema,
  schedulabilityvaultizabilityCapabilitiesResponseSchema,
  schedulabilityvaultizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildSchedulabilityvaultizabilityAdminRecords,
  buildSchedulabilityvaultizabilityAdminStats,
  getSchedulabilityvaultizabilityAdminGuidance,
  resolveSchedulabilityvaultizabilityAdminActions,
} from './schedulabilityvaultizability-admin.helpers.js'
import { evaluateSchedulabilityvaultizabilityRollout } from './schedulabilityvaultizability-rollout.helpers.js'
import { SchedulabilityvaultizabilityStatusService } from './schedulabilityvaultizability-status.service.js'

@Injectable()
export class SchedulabilityvaultizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly schedulabilityvaultizabilityStatusService: SchedulabilityvaultizabilityStatusService,
  ) {}

  getCapabilities() {
    return schedulabilityvaultizabilityCapabilitiesResponseSchema.parse({
      supportsSchedulabilityvaultizabilityRollout: true,
      supportsSchedulabilityvaultizabilityAdminTools: true,
      supportsMembershipSchedulabilityvaultizabilitySignals: true,
      supportsUsageEventSchedulabilityvaultizabilitySignals: true,
      guidance: getSchedulabilityvaultizabilityRolloutGuidance(),
    })
  }

  async getSchedulabilityvaultizabilityRollout() {
    const schedulabilityvaultizabilityTableCoverage =
      await this.schedulabilityvaultizabilityStatusService.getSchedulabilityvaultizabilityTableCoverage()

    const rollout = evaluateSchedulabilityvaultizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.schedulabilityvaultizabilityStatusService.pingPostgres(),
      existingSchedulabilityvaultizabilityTableCount: schedulabilityvaultizabilityTableCoverage.existingSchedulabilityvaultizabilityTableCount,
      workspaceMembershipsTableExists: schedulabilityvaultizabilityTableCoverage.workspaceMembershipsTableExists,
      usageEventsTableExists: schedulabilityvaultizabilityTableCoverage.usageEventsTableExists,
      billingNotificationsTableExists: schedulabilityvaultizabilityTableCoverage.billingNotificationsTableExists,
    })

    return schedulabilityvaultizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceSchedulabilityvaultizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageSchedulabilityvaultizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.schedulabilityvaultizabilityStatusService.getWorkspaceSchedulabilityvaultizabilityInventory(
        workspaceId,
      )
    const records = buildSchedulabilityvaultizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.schedulabilityvaultizabilityStatusService.pingPostgres()
    const stats = buildSchedulabilityvaultizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return schedulabilityvaultizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveSchedulabilityvaultizabilityAdminActions(),
      guidance: getSchedulabilityvaultizabilityAdminGuidance({ stats }),
    })
  }

  async executeSchedulabilityvaultizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_schedulabilityvaultizability_summary'
    },
  ) {
    this.assertCanManageSchedulabilityvaultizability(authContext)

    const payload = schedulabilityvaultizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_schedulabilityvaultizability_summary': {
        const summary = await this.getWorkspaceSchedulabilityvaultizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return schedulabilityvaultizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed schedulabilityvaultizability summary with ${summary.stats.schedulabilityvaultizabilityPercent}% membership schedulabilityvaultizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageSchedulabilityvaultizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production schedulabilityvaultizability tools.',
    })
  }
}
