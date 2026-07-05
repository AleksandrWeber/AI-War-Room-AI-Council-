import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getRecoverizabilityRolloutGuidance,
  recoverizabilityAdminActionRequestSchema,
  recoverizabilityAdminActionResponseSchema,
  recoverizabilityAdminSummaryResponseSchema,
  recoverizabilityCapabilitiesResponseSchema,
  recoverizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildRecoverizabilityAdminRecords,
  buildRecoverizabilityAdminStats,
  getRecoverizabilityAdminGuidance,
  resolveRecoverizabilityAdminActions,
} from './recoverizability-admin.helpers.js'
import { evaluateRecoverizabilityRollout } from './recoverizability-rollout.helpers.js'
import { RecoverizabilityStatusService } from './recoverizability-status.service.js'

@Injectable()
export class RecoverizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly recoverizabilityStatusService: RecoverizabilityStatusService,
  ) {}

  getCapabilities() {
    return recoverizabilityCapabilitiesResponseSchema.parse({
      supportsRecoverizabilityRollout: true,
      supportsRecoverizabilityAdminTools: true,
      supportsBillingWebhookRecoverizabilitySignals: true,
      supportsBillingRecordRecoverizabilitySignals: true,
      guidance: getRecoverizabilityRolloutGuidance(),
    })
  }

  async getRecoverizabilityRollout() {
    const recoverizabilityTableCoverage =
      await this.recoverizabilityStatusService.getRecoverizabilityTableCoverage()

    const rollout = evaluateRecoverizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.recoverizabilityStatusService.pingPostgres(),
      existingRecoverizabilityTableCount: recoverizabilityTableCoverage.existingRecoverizabilityTableCount,
      billingWebhookEventsTableExists: recoverizabilityTableCoverage.billingWebhookEventsTableExists,
      billingRecordsTableExists: recoverizabilityTableCoverage.billingRecordsTableExists,
      usageEventsTableExists: recoverizabilityTableCoverage.usageEventsTableExists,
    })

    return recoverizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceRecoverizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageRecoverizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.recoverizabilityStatusService.getWorkspaceRecoverizabilityInventory(
        workspaceId,
      )
    const records = buildRecoverizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.recoverizabilityStatusService.pingPostgres()
    const stats = buildRecoverizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return recoverizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveRecoverizabilityAdminActions(),
      guidance: getRecoverizabilityAdminGuidance({ stats }),
    })
  }

  async executeRecoverizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_recoverizability_summary'
    },
  ) {
    this.assertCanManageRecoverizability(authContext)

    const payload = recoverizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_recoverizability_summary': {
        const summary = await this.getWorkspaceRecoverizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return recoverizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed recoverizability summary with ${summary.stats.recoverizabilityPercent}% billing webhook recoverizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageRecoverizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production recoverizability tools.',
    })
  }
}
