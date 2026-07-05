import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getComposabilizabilityRolloutGuidance,
  composabilizabilityAdminActionRequestSchema,
  composabilizabilityAdminActionResponseSchema,
  composabilizabilityAdminSummaryResponseSchema,
  composabilizabilityCapabilitiesResponseSchema,
  composabilizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildComposabilizabilityAdminRecords,
  buildComposabilizabilityAdminStats,
  getComposabilizabilityAdminGuidance,
  resolveComposabilizabilityAdminActions,
} from './composabilizability-admin.helpers.js'
import { evaluateComposabilizabilityRollout } from './composabilizability-rollout.helpers.js'
import { ComposabilizabilityStatusService } from './composabilizability-status.service.js'

@Injectable()
export class ComposabilizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly composabilizabilityStatusService: ComposabilizabilityStatusService,
  ) {}

  getCapabilities() {
    return composabilizabilityCapabilitiesResponseSchema.parse({
      supportsComposabilizabilityRollout: true,
      supportsComposabilizabilityAdminTools: true,
      supportsIdempotencyKeyComposabilizabilitySignals: true,
      supportsUsageEventComposabilizabilitySignals: true,
      guidance: getComposabilizabilityRolloutGuidance(),
    })
  }

  async getComposabilizabilityRollout() {
    const composabilizabilityTableCoverage =
      await this.composabilizabilityStatusService.getComposabilizabilityTableCoverage()

    const rollout = evaluateComposabilizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.composabilizabilityStatusService.pingPostgres(),
      existingComposabilizabilityTableCount: composabilizabilityTableCoverage.existingComposabilizabilityTableCount,
      idempotencyKeysTableExists: composabilizabilityTableCoverage.idempotencyKeysTableExists,
      usageEventsTableExists: composabilizabilityTableCoverage.usageEventsTableExists,
      billingWebhookEventsTableExists: composabilizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return composabilizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceComposabilizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageComposabilizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.composabilizabilityStatusService.getWorkspaceComposabilizabilityInventory(
        workspaceId,
      )
    const records = buildComposabilizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.composabilizabilityStatusService.pingPostgres()
    const stats = buildComposabilizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return composabilizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveComposabilizabilityAdminActions(),
      guidance: getComposabilizabilityAdminGuidance({ stats }),
    })
  }

  async executeComposabilizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_composabilizability_summary'
    },
  ) {
    this.assertCanManageComposabilizability(authContext)

    const payload = composabilizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_composabilizability_summary': {
        const summary = await this.getWorkspaceComposabilizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return composabilizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed composabilizability summary with ${summary.stats.composabilizabilityPercent}% idempotency key composabilizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageComposabilizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production composabilizability tools.',
    })
  }
}
