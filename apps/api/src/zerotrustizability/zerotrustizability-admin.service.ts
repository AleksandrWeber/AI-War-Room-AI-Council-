import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getZerotrustizabilityRolloutGuidance,
  zerotrustizabilityAdminActionRequestSchema,
  zerotrustizabilityAdminActionResponseSchema,
  zerotrustizabilityAdminSummaryResponseSchema,
  zerotrustizabilityCapabilitiesResponseSchema,
  zerotrustizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildZerotrustizabilityAdminRecords,
  buildZerotrustizabilityAdminStats,
  getZerotrustizabilityAdminGuidance,
  resolveZerotrustizabilityAdminActions,
} from './zerotrustizability-admin.helpers.js'
import { evaluateZerotrustizabilityRollout } from './zerotrustizability-rollout.helpers.js'
import { ZerotrustizabilityStatusService } from './zerotrustizability-status.service.js'

@Injectable()
export class ZerotrustizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly zerotrustizabilityStatusService: ZerotrustizabilityStatusService,
  ) {}

  getCapabilities() {
    return zerotrustizabilityCapabilitiesResponseSchema.parse({
      supportsZerotrustizabilityRollout: true,
      supportsZerotrustizabilityAdminTools: true,
      supportsBillingNotificationZerotrustizabilitySignals: true,
      supportsBillingWebhookZerotrustizabilitySignals: true,
      guidance: getZerotrustizabilityRolloutGuidance(),
    })
  }

  async getZerotrustizabilityRollout() {
    const zerotrustizabilityTableCoverage =
      await this.zerotrustizabilityStatusService.getZerotrustizabilityTableCoverage()

    const rollout = evaluateZerotrustizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.zerotrustizabilityStatusService.pingPostgres(),
      existingZerotrustizabilityTableCount: zerotrustizabilityTableCoverage.existingZerotrustizabilityTableCount,
      billingNotificationsTableExists: zerotrustizabilityTableCoverage.billingNotificationsTableExists,
      billingWebhookEventsTableExists: zerotrustizabilityTableCoverage.billingWebhookEventsTableExists,
      usageEventsTableExists: zerotrustizabilityTableCoverage.usageEventsTableExists,
    })

    return zerotrustizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceZerotrustizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageZerotrustizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.zerotrustizabilityStatusService.getWorkspaceZerotrustizabilityInventory(
        workspaceId,
      )
    const records = buildZerotrustizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.zerotrustizabilityStatusService.pingPostgres()
    const stats = buildZerotrustizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return zerotrustizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveZerotrustizabilityAdminActions(),
      guidance: getZerotrustizabilityAdminGuidance({ stats }),
    })
  }

  async executeZerotrustizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_zerotrustizability_summary'
    },
  ) {
    this.assertCanManageZerotrustizability(authContext)

    const payload = zerotrustizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_zerotrustizability_summary': {
        const summary = await this.getWorkspaceZerotrustizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return zerotrustizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed zerotrustizability summary with ${summary.stats.zerotrustizabilityPercent}% billing notification zerotrustizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageZerotrustizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production zerotrustizability tools.',
    })
  }
}
