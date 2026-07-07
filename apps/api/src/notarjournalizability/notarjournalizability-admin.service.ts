import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getNotarjournalizabilityRolloutGuidance,
  notarjournalizabilityAdminActionRequestSchema,
  notarjournalizabilityAdminActionResponseSchema,
  notarjournalizabilityAdminSummaryResponseSchema,
  notarjournalizabilityCapabilitiesResponseSchema,
  notarjournalizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildNotarjournalizabilityAdminRecords,
  buildNotarjournalizabilityAdminStats,
  getNotarjournalizabilityAdminGuidance,
  resolveNotarjournalizabilityAdminActions,
} from './notarjournalizability-admin.helpers.js'
import { evaluateNotarjournalizabilityRollout } from './notarjournalizability-rollout.helpers.js'
import { NotarjournalizabilityStatusService } from './notarjournalizability-status.service.js'

@Injectable()
export class NotarjournalizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly notarjournalizabilityStatusService: NotarjournalizabilityStatusService,
  ) {}

  getCapabilities() {
    return notarjournalizabilityCapabilitiesResponseSchema.parse({
      supportsNotarjournalizabilityRollout: true,
      supportsNotarjournalizabilityAdminTools: true,
      supportsMembershipNotarjournalizabilitySignals: true,
      supportsUsageEventNotarjournalizabilitySignals: true,
      guidance: getNotarjournalizabilityRolloutGuidance(),
    })
  }

  async getNotarjournalizabilityRollout() {
    const notarjournalizabilityTableCoverage =
      await this.notarjournalizabilityStatusService.getNotarjournalizabilityTableCoverage()

    const rollout = evaluateNotarjournalizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.notarjournalizabilityStatusService.pingPostgres(),
      existingNotarjournalizabilityTableCount: notarjournalizabilityTableCoverage.existingNotarjournalizabilityTableCount,
      workspaceMembershipsTableExists: notarjournalizabilityTableCoverage.workspaceMembershipsTableExists,
      usageEventsTableExists: notarjournalizabilityTableCoverage.usageEventsTableExists,
      billingNotificationsTableExists: notarjournalizabilityTableCoverage.billingNotificationsTableExists,
    })

    return notarjournalizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceNotarjournalizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageNotarjournalizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.notarjournalizabilityStatusService.getWorkspaceNotarjournalizabilityInventory(
        workspaceId,
      )
    const records = buildNotarjournalizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.notarjournalizabilityStatusService.pingPostgres()
    const stats = buildNotarjournalizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return notarjournalizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveNotarjournalizabilityAdminActions(),
      guidance: getNotarjournalizabilityAdminGuidance({ stats }),
    })
  }

  async executeNotarjournalizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_notarjournalizability_summary'
    },
  ) {
    this.assertCanManageNotarjournalizability(authContext)

    const payload = notarjournalizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_notarjournalizability_summary': {
        const summary = await this.getWorkspaceNotarjournalizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return notarjournalizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed notarjournalizability summary with ${summary.stats.notarjournalizabilityPercent}% membership notarjournalizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageNotarjournalizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production notarjournalizability tools.',
    })
  }
}
