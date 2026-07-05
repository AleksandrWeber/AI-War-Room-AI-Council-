import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getContextualizabilityRolloutGuidance,
  contextualizabilityAdminActionRequestSchema,
  contextualizabilityAdminActionResponseSchema,
  contextualizabilityAdminSummaryResponseSchema,
  contextualizabilityCapabilitiesResponseSchema,
  contextualizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildContextualizabilityAdminRecords,
  buildContextualizabilityAdminStats,
  getContextualizabilityAdminGuidance,
  resolveContextualizabilityAdminActions,
} from './contextualizability-admin.helpers.js'
import { evaluateContextualizabilityRollout } from './contextualizability-rollout.helpers.js'
import { ContextualizabilityStatusService } from './contextualizability-status.service.js'

@Injectable()
export class ContextualizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly contextualizabilityStatusService: ContextualizabilityStatusService,
  ) {}

  getCapabilities() {
    return contextualizabilityCapabilitiesResponseSchema.parse({
      supportsContextualizabilityRollout: true,
      supportsContextualizabilityAdminTools: true,
      supportsBillingWebhookContextualizabilitySignals: true,
      supportsBillingRecordContextualizabilitySignals: true,
      guidance: getContextualizabilityRolloutGuidance(),
    })
  }

  async getContextualizabilityRollout() {
    const contextualizabilityTableCoverage =
      await this.contextualizabilityStatusService.getContextualizabilityTableCoverage()

    const rollout = evaluateContextualizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.contextualizabilityStatusService.pingPostgres(),
      existingContextualizabilityTableCount: contextualizabilityTableCoverage.existingContextualizabilityTableCount,
      billingWebhookEventsTableExists: contextualizabilityTableCoverage.billingWebhookEventsTableExists,
      billingRecordsTableExists: contextualizabilityTableCoverage.billingRecordsTableExists,
      usageEventsTableExists: contextualizabilityTableCoverage.usageEventsTableExists,
    })

    return contextualizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceContextualizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageContextualizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.contextualizabilityStatusService.getWorkspaceContextualizabilityInventory(
        workspaceId,
      )
    const records = buildContextualizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.contextualizabilityStatusService.pingPostgres()
    const stats = buildContextualizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return contextualizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveContextualizabilityAdminActions(),
      guidance: getContextualizabilityAdminGuidance({ stats }),
    })
  }

  async executeContextualizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_contextualizability_summary'
    },
  ) {
    this.assertCanManageContextualizability(authContext)

    const payload = contextualizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_contextualizability_summary': {
        const summary = await this.getWorkspaceContextualizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return contextualizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed contextualizability summary with ${summary.stats.contextualizabilityPercent}% billing webhook contextualizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageContextualizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production contextualizability tools.',
    })
  }
}
