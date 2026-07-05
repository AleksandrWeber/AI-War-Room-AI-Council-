import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getQueueizabilityRolloutGuidance,
  queueizabilityAdminActionRequestSchema,
  queueizabilityAdminActionResponseSchema,
  queueizabilityAdminSummaryResponseSchema,
  queueizabilityCapabilitiesResponseSchema,
  queueizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildQueueizabilityAdminRecords,
  buildQueueizabilityAdminStats,
  getQueueizabilityAdminGuidance,
  resolveQueueizabilityAdminActions,
} from './queueizability-admin.helpers.js'
import { evaluateQueueizabilityRollout } from './queueizability-rollout.helpers.js'
import { QueueizabilityStatusService } from './queueizability-status.service.js'

@Injectable()
export class QueueizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly queueizabilityStatusService: QueueizabilityStatusService,
  ) {}

  getCapabilities() {
    return queueizabilityCapabilitiesResponseSchema.parse({
      supportsQueueizabilityRollout: true,
      supportsQueueizabilityAdminTools: true,
      supportsIdempotencyKeyQueueizabilitySignals: true,
      supportsUsageEventQueueizabilitySignals: true,
      guidance: getQueueizabilityRolloutGuidance(),
    })
  }

  async getQueueizabilityRollout() {
    const queueizabilityTableCoverage =
      await this.queueizabilityStatusService.getQueueizabilityTableCoverage()

    const rollout = evaluateQueueizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.queueizabilityStatusService.pingPostgres(),
      existingQueueizabilityTableCount: queueizabilityTableCoverage.existingQueueizabilityTableCount,
      idempotencyKeysTableExists: queueizabilityTableCoverage.idempotencyKeysTableExists,
      usageEventsTableExists: queueizabilityTableCoverage.usageEventsTableExists,
      billingWebhookEventsTableExists: queueizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return queueizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceQueueizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageQueueizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.queueizabilityStatusService.getWorkspaceQueueizabilityInventory(
        workspaceId,
      )
    const records = buildQueueizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.queueizabilityStatusService.pingPostgres()
    const stats = buildQueueizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return queueizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveQueueizabilityAdminActions(),
      guidance: getQueueizabilityAdminGuidance({ stats }),
    })
  }

  async executeQueueizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_queueizability_summary'
    },
  ) {
    this.assertCanManageQueueizability(authContext)

    const payload = queueizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_queueizability_summary': {
        const summary = await this.getWorkspaceQueueizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return queueizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed queueizability summary with ${summary.stats.queueizabilityPercent}% idempotency key queueizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageQueueizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production queueizability tools.',
    })
  }
}
