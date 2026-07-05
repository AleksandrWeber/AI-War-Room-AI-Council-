import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getIsolatizabilityRolloutGuidance,
  isolatizabilityAdminActionRequestSchema,
  isolatizabilityAdminActionResponseSchema,
  isolatizabilityAdminSummaryResponseSchema,
  isolatizabilityCapabilitiesResponseSchema,
  isolatizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildIsolatizabilityAdminRecords,
  buildIsolatizabilityAdminStats,
  getIsolatizabilityAdminGuidance,
  resolveIsolatizabilityAdminActions,
} from './isolatizability-admin.helpers.js'
import { evaluateIsolatizabilityRollout } from './isolatizability-rollout.helpers.js'
import { IsolatizabilityStatusService } from './isolatizability-status.service.js'

@Injectable()
export class IsolatizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly isolatizabilityStatusService: IsolatizabilityStatusService,
  ) {}

  getCapabilities() {
    return isolatizabilityCapabilitiesResponseSchema.parse({
      supportsIsolatizabilityRollout: true,
      supportsIsolatizabilityAdminTools: true,
      supportsIdempotencyKeyIsolatizabilitySignals: true,
      supportsUsageEventIsolatizabilitySignals: true,
      guidance: getIsolatizabilityRolloutGuidance(),
    })
  }

  async getIsolatizabilityRollout() {
    const isolatizabilityTableCoverage =
      await this.isolatizabilityStatusService.getIsolatizabilityTableCoverage()

    const rollout = evaluateIsolatizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.isolatizabilityStatusService.pingPostgres(),
      existingIsolatizabilityTableCount: isolatizabilityTableCoverage.existingIsolatizabilityTableCount,
      idempotencyKeysTableExists: isolatizabilityTableCoverage.idempotencyKeysTableExists,
      usageEventsTableExists: isolatizabilityTableCoverage.usageEventsTableExists,
      billingWebhookEventsTableExists: isolatizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return isolatizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceIsolatizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageIsolatizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.isolatizabilityStatusService.getWorkspaceIsolatizabilityInventory(
        workspaceId,
      )
    const records = buildIsolatizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.isolatizabilityStatusService.pingPostgres()
    const stats = buildIsolatizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return isolatizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveIsolatizabilityAdminActions(),
      guidance: getIsolatizabilityAdminGuidance({ stats }),
    })
  }

  async executeIsolatizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_isolatizability_summary'
    },
  ) {
    this.assertCanManageIsolatizability(authContext)

    const payload = isolatizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_isolatizability_summary': {
        const summary = await this.getWorkspaceIsolatizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return isolatizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed isolatizability summary with ${summary.stats.isolatizabilityPercent}% idempotency key isolatizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageIsolatizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production isolatizability tools.',
    })
  }
}
