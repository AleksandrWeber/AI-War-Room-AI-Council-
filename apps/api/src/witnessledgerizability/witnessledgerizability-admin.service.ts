import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getWitnessledgerizabilityRolloutGuidance,
  witnessledgerizabilityAdminActionRequestSchema,
  witnessledgerizabilityAdminActionResponseSchema,
  witnessledgerizabilityAdminSummaryResponseSchema,
  witnessledgerizabilityCapabilitiesResponseSchema,
  witnessledgerizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildWitnessledgerizabilityAdminRecords,
  buildWitnessledgerizabilityAdminStats,
  getWitnessledgerizabilityAdminGuidance,
  resolveWitnessledgerizabilityAdminActions,
} from './witnessledgerizability-admin.helpers.js'
import { evaluateWitnessledgerizabilityRollout } from './witnessledgerizability-rollout.helpers.js'
import { WitnessledgerizabilityStatusService } from './witnessledgerizability-status.service.js'

@Injectable()
export class WitnessledgerizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly witnessledgerizabilityStatusService: WitnessledgerizabilityStatusService,
  ) {}

  getCapabilities() {
    return witnessledgerizabilityCapabilitiesResponseSchema.parse({
      supportsWitnessledgerizabilityRollout: true,
      supportsWitnessledgerizabilityAdminTools: true,
      supportsIdempotencyKeyWitnessledgerizabilitySignals: true,
      supportsUsageEventWitnessledgerizabilitySignals: true,
      guidance: getWitnessledgerizabilityRolloutGuidance(),
    })
  }

  async getWitnessledgerizabilityRollout() {
    const witnessledgerizabilityTableCoverage =
      await this.witnessledgerizabilityStatusService.getWitnessledgerizabilityTableCoverage()

    const rollout = evaluateWitnessledgerizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.witnessledgerizabilityStatusService.pingPostgres(),
      existingWitnessledgerizabilityTableCount: witnessledgerizabilityTableCoverage.existingWitnessledgerizabilityTableCount,
      idempotencyKeysTableExists: witnessledgerizabilityTableCoverage.idempotencyKeysTableExists,
      usageEventsTableExists: witnessledgerizabilityTableCoverage.usageEventsTableExists,
      billingWebhookEventsTableExists: witnessledgerizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return witnessledgerizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceWitnessledgerizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageWitnessledgerizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.witnessledgerizabilityStatusService.getWorkspaceWitnessledgerizabilityInventory(
        workspaceId,
      )
    const records = buildWitnessledgerizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.witnessledgerizabilityStatusService.pingPostgres()
    const stats = buildWitnessledgerizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return witnessledgerizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveWitnessledgerizabilityAdminActions(),
      guidance: getWitnessledgerizabilityAdminGuidance({ stats }),
    })
  }

  async executeWitnessledgerizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_witnessledgerizability_summary'
    },
  ) {
    this.assertCanManageWitnessledgerizability(authContext)

    const payload = witnessledgerizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_witnessledgerizability_summary': {
        const summary = await this.getWorkspaceWitnessledgerizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return witnessledgerizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed witnessledgerizability summary with ${summary.stats.witnessledgerizabilityPercent}% idempotency key witnessledgerizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageWitnessledgerizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production witnessledgerizability tools.',
    })
  }
}
