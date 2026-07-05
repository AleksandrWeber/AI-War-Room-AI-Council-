import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getStreamizabilityRolloutGuidance,
  streamizabilityAdminActionRequestSchema,
  streamizabilityAdminActionResponseSchema,
  streamizabilityAdminSummaryResponseSchema,
  streamizabilityCapabilitiesResponseSchema,
  streamizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildStreamizabilityAdminRecords,
  buildStreamizabilityAdminStats,
  getStreamizabilityAdminGuidance,
  resolveStreamizabilityAdminActions,
} from './streamizability-admin.helpers.js'
import { evaluateStreamizabilityRollout } from './streamizability-rollout.helpers.js'
import { StreamizabilityStatusService } from './streamizability-status.service.js'

@Injectable()
export class StreamizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly streamizabilityStatusService: StreamizabilityStatusService,
  ) {}

  getCapabilities() {
    return streamizabilityCapabilitiesResponseSchema.parse({
      supportsStreamizabilityRollout: true,
      supportsStreamizabilityAdminTools: true,
      supportsBillingInvoiceStreamizabilitySignals: true,
      supportsBillingRecordStreamizabilitySignals: true,
      guidance: getStreamizabilityRolloutGuidance(),
    })
  }

  async getStreamizabilityRollout() {
    const streamizabilityTableCoverage =
      await this.streamizabilityStatusService.getStreamizabilityTableCoverage()

    const rollout = evaluateStreamizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.streamizabilityStatusService.pingPostgres(),
      existingStreamizabilityTableCount: streamizabilityTableCoverage.existingStreamizabilityTableCount,
      billingInvoicesTableExists: streamizabilityTableCoverage.billingInvoicesTableExists,
      billingRecordsTableExists: streamizabilityTableCoverage.billingRecordsTableExists,
      billingWebhookEventsTableExists: streamizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return streamizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceStreamizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageStreamizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.streamizabilityStatusService.getWorkspaceStreamizabilityInventory(
        workspaceId,
      )
    const records = buildStreamizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.streamizabilityStatusService.pingPostgres()
    const stats = buildStreamizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return streamizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveStreamizabilityAdminActions(),
      guidance: getStreamizabilityAdminGuidance({ stats }),
    })
  }

  async executeStreamizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_streamizability_summary'
    },
  ) {
    this.assertCanManageStreamizability(authContext)

    const payload = streamizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_streamizability_summary': {
        const summary = await this.getWorkspaceStreamizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return streamizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed streamizability summary with ${summary.stats.streamizabilityPercent}% billing invoice streamizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageStreamizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production streamizability tools.',
    })
  }
}
