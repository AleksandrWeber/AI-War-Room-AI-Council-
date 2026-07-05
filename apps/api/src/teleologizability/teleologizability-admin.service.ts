import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getTeleologizabilityRolloutGuidance,
  teleologizabilityAdminActionRequestSchema,
  teleologizabilityAdminActionResponseSchema,
  teleologizabilityAdminSummaryResponseSchema,
  teleologizabilityCapabilitiesResponseSchema,
  teleologizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildTeleologizabilityAdminRecords,
  buildTeleologizabilityAdminStats,
  getTeleologizabilityAdminGuidance,
  resolveTeleologizabilityAdminActions,
} from './teleologizability-admin.helpers.js'
import { evaluateTeleologizabilityRollout } from './teleologizability-rollout.helpers.js'
import { TeleologizabilityStatusService } from './teleologizability-status.service.js'

@Injectable()
export class TeleologizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly teleologizabilityStatusService: TeleologizabilityStatusService,
  ) {}

  getCapabilities() {
    return teleologizabilityCapabilitiesResponseSchema.parse({
      supportsTeleologizabilityRollout: true,
      supportsTeleologizabilityAdminTools: true,
      supportsBillingWebhookTeleologizabilitySignals: true,
      supportsBillingRecordTeleologizabilitySignals: true,
      guidance: getTeleologizabilityRolloutGuidance(),
    })
  }

  async getTeleologizabilityRollout() {
    const teleologizabilityTableCoverage =
      await this.teleologizabilityStatusService.getTeleologizabilityTableCoverage()

    const rollout = evaluateTeleologizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.teleologizabilityStatusService.pingPostgres(),
      existingTeleologizabilityTableCount: teleologizabilityTableCoverage.existingTeleologizabilityTableCount,
      billingWebhookEventsTableExists: teleologizabilityTableCoverage.billingWebhookEventsTableExists,
      billingRecordsTableExists: teleologizabilityTableCoverage.billingRecordsTableExists,
      usageEventsTableExists: teleologizabilityTableCoverage.usageEventsTableExists,
    })

    return teleologizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceTeleologizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageTeleologizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.teleologizabilityStatusService.getWorkspaceTeleologizabilityInventory(
        workspaceId,
      )
    const records = buildTeleologizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.teleologizabilityStatusService.pingPostgres()
    const stats = buildTeleologizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return teleologizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveTeleologizabilityAdminActions(),
      guidance: getTeleologizabilityAdminGuidance({ stats }),
    })
  }

  async executeTeleologizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_teleologizability_summary'
    },
  ) {
    this.assertCanManageTeleologizability(authContext)

    const payload = teleologizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_teleologizability_summary': {
        const summary = await this.getWorkspaceTeleologizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return teleologizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed teleologizability summary with ${summary.stats.teleologizabilityPercent}% billing webhook teleologizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageTeleologizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production teleologizability tools.',
    })
  }
}
