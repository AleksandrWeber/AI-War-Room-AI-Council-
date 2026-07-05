import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getAdaptabilityRolloutGuidance,
  adaptabilityAdminActionRequestSchema,
  adaptabilityAdminActionResponseSchema,
  adaptabilityAdminSummaryResponseSchema,
  adaptabilityCapabilitiesResponseSchema,
  adaptabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildAdaptabilityAdminRecords,
  buildAdaptabilityAdminStats,
  getAdaptabilityAdminGuidance,
  resolveAdaptabilityAdminActions,
} from './adaptability-admin.helpers.js'
import { evaluateAdaptabilityRollout } from './adaptability-rollout.helpers.js'
import { AdaptabilityStatusService } from './adaptability-status.service.js'

@Injectable()
export class AdaptabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly adaptabilityStatusService: AdaptabilityStatusService,
  ) {}

  getCapabilities() {
    return adaptabilityCapabilitiesResponseSchema.parse({
      supportsAdaptabilityRollout: true,
      supportsAdaptabilityAdminTools: true,
      supportsBillingWebhookAdaptabilitySignals: true,
      supportsBillingNotificationAdaptabilitySignals: true,
      guidance: getAdaptabilityRolloutGuidance(),
    })
  }

  async getAdaptabilityRollout() {
    const adaptabilityTableCoverage =
      await this.adaptabilityStatusService.getAdaptabilityTableCoverage()

    const rollout = evaluateAdaptabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.adaptabilityStatusService.pingPostgres(),
      existingAdaptabilityTableCount: adaptabilityTableCoverage.existingAdaptabilityTableCount,
      billingWebhookEventsTableExists: adaptabilityTableCoverage.billingWebhookEventsTableExists,
      billingNotificationsTableExists: adaptabilityTableCoverage.billingNotificationsTableExists,
      idempotencyKeysTableExists: adaptabilityTableCoverage.idempotencyKeysTableExists,
    })

    return adaptabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceAdaptabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageAdaptability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.adaptabilityStatusService.getWorkspaceAdaptabilityInventory(
        workspaceId,
      )
    const records = buildAdaptabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.adaptabilityStatusService.pingPostgres()
    const stats = buildAdaptabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return adaptabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveAdaptabilityAdminActions(),
      guidance: getAdaptabilityAdminGuidance({ stats }),
    })
  }

  async executeAdaptabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_adaptability_summary'
    },
  ) {
    this.assertCanManageAdaptability(authContext)

    const payload = adaptabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_adaptability_summary': {
        const summary = await this.getWorkspaceAdaptabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return adaptabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed adaptability summary with ${summary.stats.adaptabilityPercent}% billing webhook adaptability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageAdaptability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production adaptability tools.',
    })
  }
}
