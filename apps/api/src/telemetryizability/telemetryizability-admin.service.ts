import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getTelemetryizabilityRolloutGuidance,
  telemetryizabilityAdminActionRequestSchema,
  telemetryizabilityAdminActionResponseSchema,
  telemetryizabilityAdminSummaryResponseSchema,
  telemetryizabilityCapabilitiesResponseSchema,
  telemetryizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildTelemetryizabilityAdminRecords,
  buildTelemetryizabilityAdminStats,
  getTelemetryizabilityAdminGuidance,
  resolveTelemetryizabilityAdminActions,
} from './telemetryizability-admin.helpers.js'
import { evaluateTelemetryizabilityRollout } from './telemetryizability-rollout.helpers.js'
import { TelemetryizabilityStatusService } from './telemetryizability-status.service.js'

@Injectable()
export class TelemetryizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly telemetryizabilityStatusService: TelemetryizabilityStatusService,
  ) {}

  getCapabilities() {
    return telemetryizabilityCapabilitiesResponseSchema.parse({
      supportsTelemetryizabilityRollout: true,
      supportsTelemetryizabilityAdminTools: true,
      supportsBillingNotificationTelemetryizabilitySignals: true,
      supportsBillingWebhookTelemetryizabilitySignals: true,
      guidance: getTelemetryizabilityRolloutGuidance(),
    })
  }

  async getTelemetryizabilityRollout() {
    const telemetryizabilityTableCoverage =
      await this.telemetryizabilityStatusService.getTelemetryizabilityTableCoverage()

    const rollout = evaluateTelemetryizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.telemetryizabilityStatusService.pingPostgres(),
      existingTelemetryizabilityTableCount: telemetryizabilityTableCoverage.existingTelemetryizabilityTableCount,
      billingNotificationsTableExists: telemetryizabilityTableCoverage.billingNotificationsTableExists,
      billingWebhookEventsTableExists: telemetryizabilityTableCoverage.billingWebhookEventsTableExists,
      usageEventsTableExists: telemetryizabilityTableCoverage.usageEventsTableExists,
    })

    return telemetryizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceTelemetryizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageTelemetryizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.telemetryizabilityStatusService.getWorkspaceTelemetryizabilityInventory(
        workspaceId,
      )
    const records = buildTelemetryizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.telemetryizabilityStatusService.pingPostgres()
    const stats = buildTelemetryizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return telemetryizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveTelemetryizabilityAdminActions(),
      guidance: getTelemetryizabilityAdminGuidance({ stats }),
    })
  }

  async executeTelemetryizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_telemetryizability_summary'
    },
  ) {
    this.assertCanManageTelemetryizability(authContext)

    const payload = telemetryizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_telemetryizability_summary': {
        const summary = await this.getWorkspaceTelemetryizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return telemetryizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed telemetryizability summary with ${summary.stats.telemetryizabilityPercent}% billing notification telemetryizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageTelemetryizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production telemetryizability tools.',
    })
  }
}
