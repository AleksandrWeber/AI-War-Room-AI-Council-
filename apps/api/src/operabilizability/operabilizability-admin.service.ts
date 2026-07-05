import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getOperabilizabilityRolloutGuidance,
  operabilizabilityAdminActionRequestSchema,
  operabilizabilityAdminActionResponseSchema,
  operabilizabilityAdminSummaryResponseSchema,
  operabilizabilityCapabilitiesResponseSchema,
  operabilizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildOperabilizabilityAdminRecords,
  buildOperabilizabilityAdminStats,
  getOperabilizabilityAdminGuidance,
  resolveOperabilizabilityAdminActions,
} from './operabilizability-admin.helpers.js'
import { evaluateOperabilizabilityRollout } from './operabilizability-rollout.helpers.js'
import { OperabilizabilityStatusService } from './operabilizability-status.service.js'

@Injectable()
export class OperabilizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly operabilizabilityStatusService: OperabilizabilityStatusService,
  ) {}

  getCapabilities() {
    return operabilizabilityCapabilitiesResponseSchema.parse({
      supportsOperabilizabilityRollout: true,
      supportsOperabilizabilityAdminTools: true,
      supportsIdempotencyKeyOperabilizabilitySignals: true,
      supportsUsageEventOperabilizabilitySignals: true,
      guidance: getOperabilizabilityRolloutGuidance(),
    })
  }

  async getOperabilizabilityRollout() {
    const operabilizabilityTableCoverage =
      await this.operabilizabilityStatusService.getOperabilizabilityTableCoverage()

    const rollout = evaluateOperabilizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.operabilizabilityStatusService.pingPostgres(),
      existingOperabilizabilityTableCount: operabilizabilityTableCoverage.existingOperabilizabilityTableCount,
      idempotencyKeysTableExists: operabilizabilityTableCoverage.idempotencyKeysTableExists,
      usageEventsTableExists: operabilizabilityTableCoverage.usageEventsTableExists,
      billingWebhookEventsTableExists: operabilizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return operabilizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceOperabilizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageOperabilizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.operabilizabilityStatusService.getWorkspaceOperabilizabilityInventory(
        workspaceId,
      )
    const records = buildOperabilizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.operabilizabilityStatusService.pingPostgres()
    const stats = buildOperabilizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return operabilizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveOperabilizabilityAdminActions(),
      guidance: getOperabilizabilityAdminGuidance({ stats }),
    })
  }

  async executeOperabilizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_operabilizability_summary'
    },
  ) {
    this.assertCanManageOperabilizability(authContext)

    const payload = operabilizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_operabilizability_summary': {
        const summary = await this.getWorkspaceOperabilizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return operabilizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed operabilizability summary with ${summary.stats.operabilizabilityPercent}% idempotency key operabilizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageOperabilizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production operabilizability tools.',
    })
  }
}
