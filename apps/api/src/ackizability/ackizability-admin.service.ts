import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getAckizabilityRolloutGuidance,
  ackizabilityAdminActionRequestSchema,
  ackizabilityAdminActionResponseSchema,
  ackizabilityAdminSummaryResponseSchema,
  ackizabilityCapabilitiesResponseSchema,
  ackizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildAckizabilityAdminRecords,
  buildAckizabilityAdminStats,
  getAckizabilityAdminGuidance,
  resolveAckizabilityAdminActions,
} from './ackizability-admin.helpers.js'
import { evaluateAckizabilityRollout } from './ackizability-rollout.helpers.js'
import { AckizabilityStatusService } from './ackizability-status.service.js'

@Injectable()
export class AckizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly ackizabilityStatusService: AckizabilityStatusService,
  ) {}

  getCapabilities() {
    return ackizabilityCapabilitiesResponseSchema.parse({
      supportsAckizabilityRollout: true,
      supportsAckizabilityAdminTools: true,
      supportsBillingWebhookAckizabilitySignals: true,
      supportsBillingRecordAckizabilitySignals: true,
      guidance: getAckizabilityRolloutGuidance(),
    })
  }

  async getAckizabilityRollout() {
    const ackizabilityTableCoverage =
      await this.ackizabilityStatusService.getAckizabilityTableCoverage()

    const rollout = evaluateAckizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.ackizabilityStatusService.pingPostgres(),
      existingAckizabilityTableCount: ackizabilityTableCoverage.existingAckizabilityTableCount,
      billingWebhookEventsTableExists: ackizabilityTableCoverage.billingWebhookEventsTableExists,
      billingRecordsTableExists: ackizabilityTableCoverage.billingRecordsTableExists,
      usageEventsTableExists: ackizabilityTableCoverage.usageEventsTableExists,
    })

    return ackizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceAckizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageAckizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.ackizabilityStatusService.getWorkspaceAckizabilityInventory(
        workspaceId,
      )
    const records = buildAckizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.ackizabilityStatusService.pingPostgres()
    const stats = buildAckizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return ackizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveAckizabilityAdminActions(),
      guidance: getAckizabilityAdminGuidance({ stats }),
    })
  }

  async executeAckizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_ackizability_summary'
    },
  ) {
    this.assertCanManageAckizability(authContext)

    const payload = ackizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_ackizability_summary': {
        const summary = await this.getWorkspaceAckizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return ackizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed ackizability summary with ${summary.stats.ackizabilityPercent}% billing webhook ackizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageAckizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production ackizability tools.',
    })
  }
}
