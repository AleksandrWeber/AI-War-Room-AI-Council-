import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getRetentionizabilityRolloutGuidance,
  retentionizabilityAdminActionRequestSchema,
  retentionizabilityAdminActionResponseSchema,
  retentionizabilityAdminSummaryResponseSchema,
  retentionizabilityCapabilitiesResponseSchema,
  retentionizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildRetentionizabilityAdminRecords,
  buildRetentionizabilityAdminStats,
  getRetentionizabilityAdminGuidance,
  resolveRetentionizabilityAdminActions,
} from './retentionizability-admin.helpers.js'
import { evaluateRetentionizabilityRollout } from './retentionizability-rollout.helpers.js'
import { RetentionizabilityStatusService } from './retentionizability-status.service.js'

@Injectable()
export class RetentionizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly retentionizabilityStatusService: RetentionizabilityStatusService,
  ) {}

  getCapabilities() {
    return retentionizabilityCapabilitiesResponseSchema.parse({
      supportsRetentionizabilityRollout: true,
      supportsRetentionizabilityAdminTools: true,
      supportsBillingNotificationRetentionizabilitySignals: true,
      supportsBillingWebhookRetentionizabilitySignals: true,
      guidance: getRetentionizabilityRolloutGuidance(),
    })
  }

  async getRetentionizabilityRollout() {
    const retentionizabilityTableCoverage =
      await this.retentionizabilityStatusService.getRetentionizabilityTableCoverage()

    const rollout = evaluateRetentionizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.retentionizabilityStatusService.pingPostgres(),
      existingRetentionizabilityTableCount: retentionizabilityTableCoverage.existingRetentionizabilityTableCount,
      billingNotificationsTableExists: retentionizabilityTableCoverage.billingNotificationsTableExists,
      billingWebhookEventsTableExists: retentionizabilityTableCoverage.billingWebhookEventsTableExists,
      usageEventsTableExists: retentionizabilityTableCoverage.usageEventsTableExists,
    })

    return retentionizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceRetentionizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageRetentionizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.retentionizabilityStatusService.getWorkspaceRetentionizabilityInventory(
        workspaceId,
      )
    const records = buildRetentionizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.retentionizabilityStatusService.pingPostgres()
    const stats = buildRetentionizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return retentionizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveRetentionizabilityAdminActions(),
      guidance: getRetentionizabilityAdminGuidance({ stats }),
    })
  }

  async executeRetentionizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_retentionizability_summary'
    },
  ) {
    this.assertCanManageRetentionizability(authContext)

    const payload = retentionizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_retentionizability_summary': {
        const summary = await this.getWorkspaceRetentionizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return retentionizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed retentionizability summary with ${summary.stats.retentionizabilityPercent}% billing notification retentionizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageRetentionizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production retentionizability tools.',
    })
  }
}
