import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getControlizabilityRolloutGuidance,
  controlizabilityAdminActionRequestSchema,
  controlizabilityAdminActionResponseSchema,
  controlizabilityAdminSummaryResponseSchema,
  controlizabilityCapabilitiesResponseSchema,
  controlizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildControlizabilityAdminRecords,
  buildControlizabilityAdminStats,
  getControlizabilityAdminGuidance,
  resolveControlizabilityAdminActions,
} from './controlizability-admin.helpers.js'
import { evaluateControlizabilityRollout } from './controlizability-rollout.helpers.js'
import { ControlizabilityStatusService } from './controlizability-status.service.js'

@Injectable()
export class ControlizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly controlizabilityStatusService: ControlizabilityStatusService,
  ) {}

  getCapabilities() {
    return controlizabilityCapabilitiesResponseSchema.parse({
      supportsControlizabilityRollout: true,
      supportsControlizabilityAdminTools: true,
      supportsBillingNotificationControlizabilitySignals: true,
      supportsBillingWebhookControlizabilitySignals: true,
      guidance: getControlizabilityRolloutGuidance(),
    })
  }

  async getControlizabilityRollout() {
    const controlizabilityTableCoverage =
      await this.controlizabilityStatusService.getControlizabilityTableCoverage()

    const rollout = evaluateControlizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.controlizabilityStatusService.pingPostgres(),
      existingControlizabilityTableCount: controlizabilityTableCoverage.existingControlizabilityTableCount,
      billingNotificationsTableExists: controlizabilityTableCoverage.billingNotificationsTableExists,
      billingWebhookEventsTableExists: controlizabilityTableCoverage.billingWebhookEventsTableExists,
      usageEventsTableExists: controlizabilityTableCoverage.usageEventsTableExists,
    })

    return controlizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceControlizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageControlizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.controlizabilityStatusService.getWorkspaceControlizabilityInventory(
        workspaceId,
      )
    const records = buildControlizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.controlizabilityStatusService.pingPostgres()
    const stats = buildControlizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return controlizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveControlizabilityAdminActions(),
      guidance: getControlizabilityAdminGuidance({ stats }),
    })
  }

  async executeControlizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_controlizability_summary'
    },
  ) {
    this.assertCanManageControlizability(authContext)

    const payload = controlizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_controlizability_summary': {
        const summary = await this.getWorkspaceControlizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return controlizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed controlizability summary with ${summary.stats.controlizabilityPercent}% billing notification controlizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageControlizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production controlizability tools.',
    })
  }
}
