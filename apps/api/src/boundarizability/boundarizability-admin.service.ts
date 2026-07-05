import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getBoundarizabilityRolloutGuidance,
  boundarizabilityAdminActionRequestSchema,
  boundarizabilityAdminActionResponseSchema,
  boundarizabilityAdminSummaryResponseSchema,
  boundarizabilityCapabilitiesResponseSchema,
  boundarizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildBoundarizabilityAdminRecords,
  buildBoundarizabilityAdminStats,
  getBoundarizabilityAdminGuidance,
  resolveBoundarizabilityAdminActions,
} from './boundarizability-admin.helpers.js'
import { evaluateBoundarizabilityRollout } from './boundarizability-rollout.helpers.js'
import { BoundarizabilityStatusService } from './boundarizability-status.service.js'

@Injectable()
export class BoundarizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly boundarizabilityStatusService: BoundarizabilityStatusService,
  ) {}

  getCapabilities() {
    return boundarizabilityCapabilitiesResponseSchema.parse({
      supportsBoundarizabilityRollout: true,
      supportsBoundarizabilityAdminTools: true,
      supportsBillingNotificationBoundarizabilitySignals: true,
      supportsBillingWebhookBoundarizabilitySignals: true,
      guidance: getBoundarizabilityRolloutGuidance(),
    })
  }

  async getBoundarizabilityRollout() {
    const boundarizabilityTableCoverage =
      await this.boundarizabilityStatusService.getBoundarizabilityTableCoverage()

    const rollout = evaluateBoundarizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.boundarizabilityStatusService.pingPostgres(),
      existingBoundarizabilityTableCount: boundarizabilityTableCoverage.existingBoundarizabilityTableCount,
      billingNotificationsTableExists: boundarizabilityTableCoverage.billingNotificationsTableExists,
      billingWebhookEventsTableExists: boundarizabilityTableCoverage.billingWebhookEventsTableExists,
      usageEventsTableExists: boundarizabilityTableCoverage.usageEventsTableExists,
    })

    return boundarizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceBoundarizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageBoundarizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.boundarizabilityStatusService.getWorkspaceBoundarizabilityInventory(
        workspaceId,
      )
    const records = buildBoundarizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.boundarizabilityStatusService.pingPostgres()
    const stats = buildBoundarizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return boundarizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveBoundarizabilityAdminActions(),
      guidance: getBoundarizabilityAdminGuidance({ stats }),
    })
  }

  async executeBoundarizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_boundarizability_summary'
    },
  ) {
    this.assertCanManageBoundarizability(authContext)

    const payload = boundarizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_boundarizability_summary': {
        const summary = await this.getWorkspaceBoundarizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return boundarizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed boundarizability summary with ${summary.stats.boundarizabilityPercent}% billing notification boundarizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageBoundarizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production boundarizability tools.',
    })
  }
}
