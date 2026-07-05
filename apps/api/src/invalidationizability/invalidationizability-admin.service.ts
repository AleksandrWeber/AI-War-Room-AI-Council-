import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getInvalidationizabilityRolloutGuidance,
  invalidationizabilityAdminActionRequestSchema,
  invalidationizabilityAdminActionResponseSchema,
  invalidationizabilityAdminSummaryResponseSchema,
  invalidationizabilityCapabilitiesResponseSchema,
  invalidationizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildInvalidationizabilityAdminRecords,
  buildInvalidationizabilityAdminStats,
  getInvalidationizabilityAdminGuidance,
  resolveInvalidationizabilityAdminActions,
} from './invalidationizability-admin.helpers.js'
import { evaluateInvalidationizabilityRollout } from './invalidationizability-rollout.helpers.js'
import { InvalidationizabilityStatusService } from './invalidationizability-status.service.js'

@Injectable()
export class InvalidationizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly invalidationizabilityStatusService: InvalidationizabilityStatusService,
  ) {}

  getCapabilities() {
    return invalidationizabilityCapabilitiesResponseSchema.parse({
      supportsInvalidationizabilityRollout: true,
      supportsInvalidationizabilityAdminTools: true,
      supportsIdempotencyKeyInvalidationizabilitySignals: true,
      supportsUsageEventInvalidationizabilitySignals: true,
      guidance: getInvalidationizabilityRolloutGuidance(),
    })
  }

  async getInvalidationizabilityRollout() {
    const invalidationizabilityTableCoverage =
      await this.invalidationizabilityStatusService.getInvalidationizabilityTableCoverage()

    const rollout = evaluateInvalidationizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.invalidationizabilityStatusService.pingPostgres(),
      existingInvalidationizabilityTableCount: invalidationizabilityTableCoverage.existingInvalidationizabilityTableCount,
      idempotencyKeysTableExists: invalidationizabilityTableCoverage.idempotencyKeysTableExists,
      usageEventsTableExists: invalidationizabilityTableCoverage.usageEventsTableExists,
      billingWebhookEventsTableExists: invalidationizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return invalidationizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceInvalidationizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageInvalidationizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.invalidationizabilityStatusService.getWorkspaceInvalidationizabilityInventory(
        workspaceId,
      )
    const records = buildInvalidationizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.invalidationizabilityStatusService.pingPostgres()
    const stats = buildInvalidationizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return invalidationizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveInvalidationizabilityAdminActions(),
      guidance: getInvalidationizabilityAdminGuidance({ stats }),
    })
  }

  async executeInvalidationizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_invalidationizability_summary'
    },
  ) {
    this.assertCanManageInvalidationizability(authContext)

    const payload = invalidationizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_invalidationizability_summary': {
        const summary = await this.getWorkspaceInvalidationizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return invalidationizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed invalidationizability summary with ${summary.stats.invalidationizabilityPercent}% idempotency key invalidationizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageInvalidationizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production invalidationizability tools.',
    })
  }
}
