import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getEnunciabilityRolloutGuidance,
  enunciabilityAdminActionRequestSchema,
  enunciabilityAdminActionResponseSchema,
  enunciabilityAdminSummaryResponseSchema,
  enunciabilityCapabilitiesResponseSchema,
  enunciabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildEnunciabilityAdminRecords,
  buildEnunciabilityAdminStats,
  getEnunciabilityAdminGuidance,
  resolveEnunciabilityAdminActions,
} from './enunciability-admin.helpers.js'
import { evaluateEnunciabilityRollout } from './enunciability-rollout.helpers.js'
import { EnunciabilityStatusService } from './enunciability-status.service.js'

@Injectable()
export class EnunciabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly enunciabilityStatusService: EnunciabilityStatusService,
  ) {}

  getCapabilities() {
    return enunciabilityCapabilitiesResponseSchema.parse({
      supportsEnunciabilityRollout: true,
      supportsEnunciabilityAdminTools: true,
      supportsBillingNotificationEnunciabilitySignals: true,
      supportsBillingWebhookEnunciabilitySignals: true,
      guidance: getEnunciabilityRolloutGuidance(),
    })
  }

  async getEnunciabilityRollout() {
    const enunciabilityTableCoverage =
      await this.enunciabilityStatusService.getEnunciabilityTableCoverage()

    const rollout = evaluateEnunciabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.enunciabilityStatusService.pingPostgres(),
      existingEnunciabilityTableCount: enunciabilityTableCoverage.existingEnunciabilityTableCount,
      billingNotificationsTableExists: enunciabilityTableCoverage.billingNotificationsTableExists,
      billingWebhookEventsTableExists: enunciabilityTableCoverage.billingWebhookEventsTableExists,
      usageEventsTableExists: enunciabilityTableCoverage.usageEventsTableExists,
    })

    return enunciabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceEnunciabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageEnunciability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.enunciabilityStatusService.getWorkspaceEnunciabilityInventory(
        workspaceId,
      )
    const records = buildEnunciabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.enunciabilityStatusService.pingPostgres()
    const stats = buildEnunciabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return enunciabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveEnunciabilityAdminActions(),
      guidance: getEnunciabilityAdminGuidance({ stats }),
    })
  }

  async executeEnunciabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_enunciability_summary'
    },
  ) {
    this.assertCanManageEnunciability(authContext)

    const payload = enunciabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_enunciability_summary': {
        const summary = await this.getWorkspaceEnunciabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return enunciabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed enunciability summary with ${summary.stats.enunciabilityPercent}% billing notification enunciability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageEnunciability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production enunciability tools.',
    })
  }
}
