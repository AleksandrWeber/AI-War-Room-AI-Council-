import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getDeducizabilityRolloutGuidance,
  deducizabilityAdminActionRequestSchema,
  deducizabilityAdminActionResponseSchema,
  deducizabilityAdminSummaryResponseSchema,
  deducizabilityCapabilitiesResponseSchema,
  deducizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildDeducizabilityAdminRecords,
  buildDeducizabilityAdminStats,
  getDeducizabilityAdminGuidance,
  resolveDeducizabilityAdminActions,
} from './deducizability-admin.helpers.js'
import { evaluateDeducizabilityRollout } from './deducizability-rollout.helpers.js'
import { DeducizabilityStatusService } from './deducizability-status.service.js'

@Injectable()
export class DeducizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly deducizabilityStatusService: DeducizabilityStatusService,
  ) {}

  getCapabilities() {
    return deducizabilityCapabilitiesResponseSchema.parse({
      supportsDeducizabilityRollout: true,
      supportsDeducizabilityAdminTools: true,
      supportsBillingNotificationDeducizabilitySignals: true,
      supportsBillingWebhookDeducizabilitySignals: true,
      guidance: getDeducizabilityRolloutGuidance(),
    })
  }

  async getDeducizabilityRollout() {
    const deducizabilityTableCoverage =
      await this.deducizabilityStatusService.getDeducizabilityTableCoverage()

    const rollout = evaluateDeducizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.deducizabilityStatusService.pingPostgres(),
      existingDeducizabilityTableCount: deducizabilityTableCoverage.existingDeducizabilityTableCount,
      billingNotificationsTableExists: deducizabilityTableCoverage.billingNotificationsTableExists,
      billingWebhookEventsTableExists: deducizabilityTableCoverage.billingWebhookEventsTableExists,
      usageEventsTableExists: deducizabilityTableCoverage.usageEventsTableExists,
    })

    return deducizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceDeducizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageDeducizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.deducizabilityStatusService.getWorkspaceDeducizabilityInventory(
        workspaceId,
      )
    const records = buildDeducizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.deducizabilityStatusService.pingPostgres()
    const stats = buildDeducizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return deducizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveDeducizabilityAdminActions(),
      guidance: getDeducizabilityAdminGuidance({ stats }),
    })
  }

  async executeDeducizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_deducizability_summary'
    },
  ) {
    this.assertCanManageDeducizability(authContext)

    const payload = deducizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_deducizability_summary': {
        const summary = await this.getWorkspaceDeducizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return deducizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed deducizability summary with ${summary.stats.deducizabilityPercent}% billing notification deducizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageDeducizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production deducizability tools.',
    })
  }
}
