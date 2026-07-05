import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getTolerizabilityRolloutGuidance,
  tolerizabilityAdminActionRequestSchema,
  tolerizabilityAdminActionResponseSchema,
  tolerizabilityAdminSummaryResponseSchema,
  tolerizabilityCapabilitiesResponseSchema,
  tolerizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildTolerizabilityAdminRecords,
  buildTolerizabilityAdminStats,
  getTolerizabilityAdminGuidance,
  resolveTolerizabilityAdminActions,
} from './tolerizability-admin.helpers.js'
import { evaluateTolerizabilityRollout } from './tolerizability-rollout.helpers.js'
import { TolerizabilityStatusService } from './tolerizability-status.service.js'

@Injectable()
export class TolerizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly tolerizabilityStatusService: TolerizabilityStatusService,
  ) {}

  getCapabilities() {
    return tolerizabilityCapabilitiesResponseSchema.parse({
      supportsTolerizabilityRollout: true,
      supportsTolerizabilityAdminTools: true,
      supportsBillingNotificationTolerizabilitySignals: true,
      supportsBillingWebhookTolerizabilitySignals: true,
      guidance: getTolerizabilityRolloutGuidance(),
    })
  }

  async getTolerizabilityRollout() {
    const tolerizabilityTableCoverage =
      await this.tolerizabilityStatusService.getTolerizabilityTableCoverage()

    const rollout = evaluateTolerizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.tolerizabilityStatusService.pingPostgres(),
      existingTolerizabilityTableCount: tolerizabilityTableCoverage.existingTolerizabilityTableCount,
      billingNotificationsTableExists: tolerizabilityTableCoverage.billingNotificationsTableExists,
      billingWebhookEventsTableExists: tolerizabilityTableCoverage.billingWebhookEventsTableExists,
      usageEventsTableExists: tolerizabilityTableCoverage.usageEventsTableExists,
    })

    return tolerizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceTolerizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageTolerizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.tolerizabilityStatusService.getWorkspaceTolerizabilityInventory(
        workspaceId,
      )
    const records = buildTolerizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.tolerizabilityStatusService.pingPostgres()
    const stats = buildTolerizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return tolerizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveTolerizabilityAdminActions(),
      guidance: getTolerizabilityAdminGuidance({ stats }),
    })
  }

  async executeTolerizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_tolerizability_summary'
    },
  ) {
    this.assertCanManageTolerizability(authContext)

    const payload = tolerizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_tolerizability_summary': {
        const summary = await this.getWorkspaceTolerizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return tolerizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed tolerizability summary with ${summary.stats.tolerizabilityPercent}% billing notification tolerizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageTolerizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production tolerizability tools.',
    })
  }
}
