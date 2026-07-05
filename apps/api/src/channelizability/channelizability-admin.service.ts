import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getChannelizabilityRolloutGuidance,
  channelizabilityAdminActionRequestSchema,
  channelizabilityAdminActionResponseSchema,
  channelizabilityAdminSummaryResponseSchema,
  channelizabilityCapabilitiesResponseSchema,
  channelizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildChannelizabilityAdminRecords,
  buildChannelizabilityAdminStats,
  getChannelizabilityAdminGuidance,
  resolveChannelizabilityAdminActions,
} from './channelizability-admin.helpers.js'
import { evaluateChannelizabilityRollout } from './channelizability-rollout.helpers.js'
import { ChannelizabilityStatusService } from './channelizability-status.service.js'

@Injectable()
export class ChannelizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly channelizabilityStatusService: ChannelizabilityStatusService,
  ) {}

  getCapabilities() {
    return channelizabilityCapabilitiesResponseSchema.parse({
      supportsChannelizabilityRollout: true,
      supportsChannelizabilityAdminTools: true,
      supportsBillingInvoiceChannelizabilitySignals: true,
      supportsBillingRecordChannelizabilitySignals: true,
      guidance: getChannelizabilityRolloutGuidance(),
    })
  }

  async getChannelizabilityRollout() {
    const channelizabilityTableCoverage =
      await this.channelizabilityStatusService.getChannelizabilityTableCoverage()

    const rollout = evaluateChannelizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.channelizabilityStatusService.pingPostgres(),
      existingChannelizabilityTableCount: channelizabilityTableCoverage.existingChannelizabilityTableCount,
      billingInvoicesTableExists: channelizabilityTableCoverage.billingInvoicesTableExists,
      billingRecordsTableExists: channelizabilityTableCoverage.billingRecordsTableExists,
      billingWebhookEventsTableExists: channelizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return channelizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceChannelizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageChannelizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.channelizabilityStatusService.getWorkspaceChannelizabilityInventory(
        workspaceId,
      )
    const records = buildChannelizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.channelizabilityStatusService.pingPostgres()
    const stats = buildChannelizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return channelizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveChannelizabilityAdminActions(),
      guidance: getChannelizabilityAdminGuidance({ stats }),
    })
  }

  async executeChannelizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_channelizability_summary'
    },
  ) {
    this.assertCanManageChannelizability(authContext)

    const payload = channelizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_channelizability_summary': {
        const summary = await this.getWorkspaceChannelizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return channelizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed channelizability summary with ${summary.stats.channelizabilityPercent}% billing invoice channelizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageChannelizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production channelizability tools.',
    })
  }
}
