import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getTrustworthinessvaultizabilityRolloutGuidance,
  trustworthinessvaultizabilityAdminActionRequestSchema,
  trustworthinessvaultizabilityAdminActionResponseSchema,
  trustworthinessvaultizabilityAdminSummaryResponseSchema,
  trustworthinessvaultizabilityCapabilitiesResponseSchema,
  trustworthinessvaultizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildTrustworthinessvaultizabilityAdminRecords,
  buildTrustworthinessvaultizabilityAdminStats,
  getTrustworthinessvaultizabilityAdminGuidance,
  resolveTrustworthinessvaultizabilityAdminActions,
} from './trustworthinessvaultizability-admin.helpers.js'
import { evaluateTrustworthinessvaultizabilityRollout } from './trustworthinessvaultizability-rollout.helpers.js'
import { TrustworthinessvaultizabilityStatusService } from './trustworthinessvaultizability-status.service.js'

@Injectable()
export class TrustworthinessvaultizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly trustworthinessvaultizabilityStatusService: TrustworthinessvaultizabilityStatusService,
  ) {}

  getCapabilities() {
    return trustworthinessvaultizabilityCapabilitiesResponseSchema.parse({
      supportsTrustworthinessvaultizabilityRollout: true,
      supportsTrustworthinessvaultizabilityAdminTools: true,
      supportsBillingNotificationTrustworthinessvaultizabilitySignals: true,
      supportsBillingWebhookTrustworthinessvaultizabilitySignals: true,
      guidance: getTrustworthinessvaultizabilityRolloutGuidance(),
    })
  }

  async getTrustworthinessvaultizabilityRollout() {
    const trustworthinessvaultizabilityTableCoverage =
      await this.trustworthinessvaultizabilityStatusService.getTrustworthinessvaultizabilityTableCoverage()

    const rollout = evaluateTrustworthinessvaultizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.trustworthinessvaultizabilityStatusService.pingPostgres(),
      existingTrustworthinessvaultizabilityTableCount: trustworthinessvaultizabilityTableCoverage.existingTrustworthinessvaultizabilityTableCount,
      billingNotificationsTableExists: trustworthinessvaultizabilityTableCoverage.billingNotificationsTableExists,
      billingWebhookEventsTableExists: trustworthinessvaultizabilityTableCoverage.billingWebhookEventsTableExists,
      usageEventsTableExists: trustworthinessvaultizabilityTableCoverage.usageEventsTableExists,
    })

    return trustworthinessvaultizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceTrustworthinessvaultizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageTrustworthinessvaultizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.trustworthinessvaultizabilityStatusService.getWorkspaceTrustworthinessvaultizabilityInventory(
        workspaceId,
      )
    const records = buildTrustworthinessvaultizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.trustworthinessvaultizabilityStatusService.pingPostgres()
    const stats = buildTrustworthinessvaultizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return trustworthinessvaultizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveTrustworthinessvaultizabilityAdminActions(),
      guidance: getTrustworthinessvaultizabilityAdminGuidance({ stats }),
    })
  }

  async executeTrustworthinessvaultizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_trustworthinessvaultizability_summary'
    },
  ) {
    this.assertCanManageTrustworthinessvaultizability(authContext)

    const payload = trustworthinessvaultizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_trustworthinessvaultizability_summary': {
        const summary = await this.getWorkspaceTrustworthinessvaultizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return trustworthinessvaultizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed trustworthinessvaultizability summary with ${summary.stats.trustworthinessvaultizabilityPercent}% billing notification trustworthinessvaultizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageTrustworthinessvaultizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production trustworthinessvaultizability tools.',
    })
  }
}
