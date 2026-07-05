import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getExpirationizabilityRolloutGuidance,
  expirationizabilityAdminActionRequestSchema,
  expirationizabilityAdminActionResponseSchema,
  expirationizabilityAdminSummaryResponseSchema,
  expirationizabilityCapabilitiesResponseSchema,
  expirationizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildExpirationizabilityAdminRecords,
  buildExpirationizabilityAdminStats,
  getExpirationizabilityAdminGuidance,
  resolveExpirationizabilityAdminActions,
} from './expirationizability-admin.helpers.js'
import { evaluateExpirationizabilityRollout } from './expirationizability-rollout.helpers.js'
import { ExpirationizabilityStatusService } from './expirationizability-status.service.js'

@Injectable()
export class ExpirationizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly expirationizabilityStatusService: ExpirationizabilityStatusService,
  ) {}

  getCapabilities() {
    return expirationizabilityCapabilitiesResponseSchema.parse({
      supportsExpirationizabilityRollout: true,
      supportsExpirationizabilityAdminTools: true,
      supportsBillingNotificationExpirationizabilitySignals: true,
      supportsBillingWebhookExpirationizabilitySignals: true,
      guidance: getExpirationizabilityRolloutGuidance(),
    })
  }

  async getExpirationizabilityRollout() {
    const expirationizabilityTableCoverage =
      await this.expirationizabilityStatusService.getExpirationizabilityTableCoverage()

    const rollout = evaluateExpirationizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.expirationizabilityStatusService.pingPostgres(),
      existingExpirationizabilityTableCount: expirationizabilityTableCoverage.existingExpirationizabilityTableCount,
      billingNotificationsTableExists: expirationizabilityTableCoverage.billingNotificationsTableExists,
      billingWebhookEventsTableExists: expirationizabilityTableCoverage.billingWebhookEventsTableExists,
      usageEventsTableExists: expirationizabilityTableCoverage.usageEventsTableExists,
    })

    return expirationizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceExpirationizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageExpirationizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.expirationizabilityStatusService.getWorkspaceExpirationizabilityInventory(
        workspaceId,
      )
    const records = buildExpirationizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.expirationizabilityStatusService.pingPostgres()
    const stats = buildExpirationizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return expirationizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveExpirationizabilityAdminActions(),
      guidance: getExpirationizabilityAdminGuidance({ stats }),
    })
  }

  async executeExpirationizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_expirationizability_summary'
    },
  ) {
    this.assertCanManageExpirationizability(authContext)

    const payload = expirationizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_expirationizability_summary': {
        const summary = await this.getWorkspaceExpirationizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return expirationizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed expirationizability summary with ${summary.stats.expirationizabilityPercent}% billing notification expirationizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageExpirationizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production expirationizability tools.',
    })
  }
}
