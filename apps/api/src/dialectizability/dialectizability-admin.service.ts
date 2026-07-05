import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getDialectizabilityRolloutGuidance,
  dialectizabilityAdminActionRequestSchema,
  dialectizabilityAdminActionResponseSchema,
  dialectizabilityAdminSummaryResponseSchema,
  dialectizabilityCapabilitiesResponseSchema,
  dialectizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildDialectizabilityAdminRecords,
  buildDialectizabilityAdminStats,
  getDialectizabilityAdminGuidance,
  resolveDialectizabilityAdminActions,
} from './dialectizability-admin.helpers.js'
import { evaluateDialectizabilityRollout } from './dialectizability-rollout.helpers.js'
import { DialectizabilityStatusService } from './dialectizability-status.service.js'

@Injectable()
export class DialectizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly dialectizabilityStatusService: DialectizabilityStatusService,
  ) {}

  getCapabilities() {
    return dialectizabilityCapabilitiesResponseSchema.parse({
      supportsDialectizabilityRollout: true,
      supportsDialectizabilityAdminTools: true,
      supportsIdempotencyKeyDialectizabilitySignals: true,
      supportsUsageEventDialectizabilitySignals: true,
      guidance: getDialectizabilityRolloutGuidance(),
    })
  }

  async getDialectizabilityRollout() {
    const dialectizabilityTableCoverage =
      await this.dialectizabilityStatusService.getDialectizabilityTableCoverage()

    const rollout = evaluateDialectizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.dialectizabilityStatusService.pingPostgres(),
      existingDialectizabilityTableCount: dialectizabilityTableCoverage.existingDialectizabilityTableCount,
      idempotencyKeysTableExists: dialectizabilityTableCoverage.idempotencyKeysTableExists,
      usageEventsTableExists: dialectizabilityTableCoverage.usageEventsTableExists,
      billingWebhookEventsTableExists: dialectizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return dialectizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceDialectizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageDialectizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.dialectizabilityStatusService.getWorkspaceDialectizabilityInventory(
        workspaceId,
      )
    const records = buildDialectizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.dialectizabilityStatusService.pingPostgres()
    const stats = buildDialectizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return dialectizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveDialectizabilityAdminActions(),
      guidance: getDialectizabilityAdminGuidance({ stats }),
    })
  }

  async executeDialectizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_dialectizability_summary'
    },
  ) {
    this.assertCanManageDialectizability(authContext)

    const payload = dialectizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_dialectizability_summary': {
        const summary = await this.getWorkspaceDialectizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return dialectizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed dialectizability summary with ${summary.stats.dialectizabilityPercent}% idempotency key dialectizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageDialectizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production dialectizability tools.',
    })
  }
}
