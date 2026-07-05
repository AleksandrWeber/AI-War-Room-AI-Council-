import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getObservabilizabilityRolloutGuidance,
  observabilizabilityAdminActionRequestSchema,
  observabilizabilityAdminActionResponseSchema,
  observabilizabilityAdminSummaryResponseSchema,
  observabilizabilityCapabilitiesResponseSchema,
  observabilizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildObservabilizabilityAdminRecords,
  buildObservabilizabilityAdminStats,
  getObservabilizabilityAdminGuidance,
  resolveObservabilizabilityAdminActions,
} from './observabilizability-admin.helpers.js'
import { evaluateObservabilizabilityRollout } from './observabilizability-rollout.helpers.js'
import { ObservabilizabilityStatusService } from './observabilizability-status.service.js'

@Injectable()
export class ObservabilizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly observabilizabilityStatusService: ObservabilizabilityStatusService,
  ) {}

  getCapabilities() {
    return observabilizabilityCapabilitiesResponseSchema.parse({
      supportsObservabilizabilityRollout: true,
      supportsObservabilizabilityAdminTools: true,
      supportsBillingNotificationObservabilizabilitySignals: true,
      supportsBillingWebhookObservabilizabilitySignals: true,
      guidance: getObservabilizabilityRolloutGuidance(),
    })
  }

  async getObservabilizabilityRollout() {
    const observabilizabilityTableCoverage =
      await this.observabilizabilityStatusService.getObservabilizabilityTableCoverage()

    const rollout = evaluateObservabilizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.observabilizabilityStatusService.pingPostgres(),
      existingObservabilizabilityTableCount: observabilizabilityTableCoverage.existingObservabilizabilityTableCount,
      billingNotificationsTableExists: observabilizabilityTableCoverage.billingNotificationsTableExists,
      billingWebhookEventsTableExists: observabilizabilityTableCoverage.billingWebhookEventsTableExists,
      usageEventsTableExists: observabilizabilityTableCoverage.usageEventsTableExists,
    })

    return observabilizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceObservabilizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageObservabilizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.observabilizabilityStatusService.getWorkspaceObservabilizabilityInventory(
        workspaceId,
      )
    const records = buildObservabilizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.observabilizabilityStatusService.pingPostgres()
    const stats = buildObservabilizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return observabilizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveObservabilizabilityAdminActions(),
      guidance: getObservabilizabilityAdminGuidance({ stats }),
    })
  }

  async executeObservabilizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_observabilizability_summary'
    },
  ) {
    this.assertCanManageObservabilizability(authContext)

    const payload = observabilizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_observabilizability_summary': {
        const summary = await this.getWorkspaceObservabilizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return observabilizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed observabilizability summary with ${summary.stats.observabilizabilityPercent}% billing notification observabilizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageObservabilizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production observabilizability tools.',
    })
  }
}
