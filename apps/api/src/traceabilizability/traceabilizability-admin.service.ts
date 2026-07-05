import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getTraceabilizabilityRolloutGuidance,
  traceabilizabilityAdminActionRequestSchema,
  traceabilizabilityAdminActionResponseSchema,
  traceabilizabilityAdminSummaryResponseSchema,
  traceabilizabilityCapabilitiesResponseSchema,
  traceabilizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildTraceabilizabilityAdminRecords,
  buildTraceabilizabilityAdminStats,
  getTraceabilizabilityAdminGuidance,
  resolveTraceabilizabilityAdminActions,
} from './traceabilizability-admin.helpers.js'
import { evaluateTraceabilizabilityRollout } from './traceabilizability-rollout.helpers.js'
import { TraceabilizabilityStatusService } from './traceabilizability-status.service.js'

@Injectable()
export class TraceabilizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly traceabilizabilityStatusService: TraceabilizabilityStatusService,
  ) {}

  getCapabilities() {
    return traceabilizabilityCapabilitiesResponseSchema.parse({
      supportsTraceabilizabilityRollout: true,
      supportsTraceabilizabilityAdminTools: true,
      supportsIdempotencyKeyTraceabilizabilitySignals: true,
      supportsUsageEventTraceabilizabilitySignals: true,
      guidance: getTraceabilizabilityRolloutGuidance(),
    })
  }

  async getTraceabilizabilityRollout() {
    const traceabilizabilityTableCoverage =
      await this.traceabilizabilityStatusService.getTraceabilizabilityTableCoverage()

    const rollout = evaluateTraceabilizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.traceabilizabilityStatusService.pingPostgres(),
      existingTraceabilizabilityTableCount: traceabilizabilityTableCoverage.existingTraceabilizabilityTableCount,
      idempotencyKeysTableExists: traceabilizabilityTableCoverage.idempotencyKeysTableExists,
      usageEventsTableExists: traceabilizabilityTableCoverage.usageEventsTableExists,
      billingWebhookEventsTableExists: traceabilizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return traceabilizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceTraceabilizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageTraceabilizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.traceabilizabilityStatusService.getWorkspaceTraceabilizabilityInventory(
        workspaceId,
      )
    const records = buildTraceabilizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.traceabilizabilityStatusService.pingPostgres()
    const stats = buildTraceabilizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return traceabilizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveTraceabilizabilityAdminActions(),
      guidance: getTraceabilizabilityAdminGuidance({ stats }),
    })
  }

  async executeTraceabilizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_traceabilizability_summary'
    },
  ) {
    this.assertCanManageTraceabilizability(authContext)

    const payload = traceabilizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_traceabilizability_summary': {
        const summary = await this.getWorkspaceTraceabilizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return traceabilizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed traceabilizability summary with ${summary.stats.traceabilizabilityPercent}% idempotency key traceabilizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageTraceabilizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production traceabilizability tools.',
    })
  }
}
