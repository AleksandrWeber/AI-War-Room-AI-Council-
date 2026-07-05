import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getBroadcastizabilityRolloutGuidance,
  broadcastizabilityAdminActionRequestSchema,
  broadcastizabilityAdminActionResponseSchema,
  broadcastizabilityAdminSummaryResponseSchema,
  broadcastizabilityCapabilitiesResponseSchema,
  broadcastizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildBroadcastizabilityAdminRecords,
  buildBroadcastizabilityAdminStats,
  getBroadcastizabilityAdminGuidance,
  resolveBroadcastizabilityAdminActions,
} from './broadcastizability-admin.helpers.js'
import { evaluateBroadcastizabilityRollout } from './broadcastizability-rollout.helpers.js'
import { BroadcastizabilityStatusService } from './broadcastizability-status.service.js'

@Injectable()
export class BroadcastizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly broadcastizabilityStatusService: BroadcastizabilityStatusService,
  ) {}

  getCapabilities() {
    return broadcastizabilityCapabilitiesResponseSchema.parse({
      supportsBroadcastizabilityRollout: true,
      supportsBroadcastizabilityAdminTools: true,
      supportsBillingInvoiceBroadcastizabilitySignals: true,
      supportsBillingRecordBroadcastizabilitySignals: true,
      guidance: getBroadcastizabilityRolloutGuidance(),
    })
  }

  async getBroadcastizabilityRollout() {
    const broadcastizabilityTableCoverage =
      await this.broadcastizabilityStatusService.getBroadcastizabilityTableCoverage()

    const rollout = evaluateBroadcastizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.broadcastizabilityStatusService.pingPostgres(),
      existingBroadcastizabilityTableCount: broadcastizabilityTableCoverage.existingBroadcastizabilityTableCount,
      billingInvoicesTableExists: broadcastizabilityTableCoverage.billingInvoicesTableExists,
      billingRecordsTableExists: broadcastizabilityTableCoverage.billingRecordsTableExists,
      billingWebhookEventsTableExists: broadcastizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return broadcastizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceBroadcastizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageBroadcastizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.broadcastizabilityStatusService.getWorkspaceBroadcastizabilityInventory(
        workspaceId,
      )
    const records = buildBroadcastizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.broadcastizabilityStatusService.pingPostgres()
    const stats = buildBroadcastizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return broadcastizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveBroadcastizabilityAdminActions(),
      guidance: getBroadcastizabilityAdminGuidance({ stats }),
    })
  }

  async executeBroadcastizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_broadcastizability_summary'
    },
  ) {
    this.assertCanManageBroadcastizability(authContext)

    const payload = broadcastizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_broadcastizability_summary': {
        const summary = await this.getWorkspaceBroadcastizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return broadcastizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed broadcastizability summary with ${summary.stats.broadcastizabilityPercent}% billing invoice broadcastizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageBroadcastizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production broadcastizability tools.',
    })
  }
}
