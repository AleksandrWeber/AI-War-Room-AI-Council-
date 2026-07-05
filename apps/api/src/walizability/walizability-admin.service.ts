import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getWalizabilityRolloutGuidance,
  walizabilityAdminActionRequestSchema,
  walizabilityAdminActionResponseSchema,
  walizabilityAdminSummaryResponseSchema,
  walizabilityCapabilitiesResponseSchema,
  walizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildWalizabilityAdminRecords,
  buildWalizabilityAdminStats,
  getWalizabilityAdminGuidance,
  resolveWalizabilityAdminActions,
} from './walizability-admin.helpers.js'
import { evaluateWalizabilityRollout } from './walizability-rollout.helpers.js'
import { WalizabilityStatusService } from './walizability-status.service.js'

@Injectable()
export class WalizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly walizabilityStatusService: WalizabilityStatusService,
  ) {}

  getCapabilities() {
    return walizabilityCapabilitiesResponseSchema.parse({
      supportsWalizabilityRollout: true,
      supportsWalizabilityAdminTools: true,
      supportsBillingNotificationWalizabilitySignals: true,
      supportsBillingWebhookWalizabilitySignals: true,
      guidance: getWalizabilityRolloutGuidance(),
    })
  }

  async getWalizabilityRollout() {
    const walizabilityTableCoverage =
      await this.walizabilityStatusService.getWalizabilityTableCoverage()

    const rollout = evaluateWalizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.walizabilityStatusService.pingPostgres(),
      existingWalizabilityTableCount: walizabilityTableCoverage.existingWalizabilityTableCount,
      billingNotificationsTableExists: walizabilityTableCoverage.billingNotificationsTableExists,
      billingWebhookEventsTableExists: walizabilityTableCoverage.billingWebhookEventsTableExists,
      usageEventsTableExists: walizabilityTableCoverage.usageEventsTableExists,
    })

    return walizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceWalizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageWalizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.walizabilityStatusService.getWorkspaceWalizabilityInventory(
        workspaceId,
      )
    const records = buildWalizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.walizabilityStatusService.pingPostgres()
    const stats = buildWalizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return walizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveWalizabilityAdminActions(),
      guidance: getWalizabilityAdminGuidance({ stats }),
    })
  }

  async executeWalizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_walizability_summary'
    },
  ) {
    this.assertCanManageWalizability(authContext)

    const payload = walizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_walizability_summary': {
        const summary = await this.getWorkspaceWalizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return walizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed walizability summary with ${summary.stats.walizabilityPercent}% billing notification walizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageWalizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production walizability tools.',
    })
  }
}
