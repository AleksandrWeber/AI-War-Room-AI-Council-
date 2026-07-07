import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getOperabilityvaultizabilityRolloutGuidance,
  operabilityvaultizabilityAdminActionRequestSchema,
  operabilityvaultizabilityAdminActionResponseSchema,
  operabilityvaultizabilityAdminSummaryResponseSchema,
  operabilityvaultizabilityCapabilitiesResponseSchema,
  operabilityvaultizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildOperabilityvaultizabilityAdminRecords,
  buildOperabilityvaultizabilityAdminStats,
  getOperabilityvaultizabilityAdminGuidance,
  resolveOperabilityvaultizabilityAdminActions,
} from './operabilityvaultizability-admin.helpers.js'
import { evaluateOperabilityvaultizabilityRollout } from './operabilityvaultizability-rollout.helpers.js'
import { OperabilityvaultizabilityStatusService } from './operabilityvaultizability-status.service.js'

@Injectable()
export class OperabilityvaultizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly operabilityvaultizabilityStatusService: OperabilityvaultizabilityStatusService,
  ) {}

  getCapabilities() {
    return operabilityvaultizabilityCapabilitiesResponseSchema.parse({
      supportsOperabilityvaultizabilityRollout: true,
      supportsOperabilityvaultizabilityAdminTools: true,
      supportsIdempotencyKeyOperabilityvaultizabilitySignals: true,
      supportsUsageEventOperabilityvaultizabilitySignals: true,
      guidance: getOperabilityvaultizabilityRolloutGuidance(),
    })
  }

  async getOperabilityvaultizabilityRollout() {
    const operabilityvaultizabilityTableCoverage =
      await this.operabilityvaultizabilityStatusService.getOperabilityvaultizabilityTableCoverage()

    const rollout = evaluateOperabilityvaultizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.operabilityvaultizabilityStatusService.pingPostgres(),
      existingOperabilityvaultizabilityTableCount: operabilityvaultizabilityTableCoverage.existingOperabilityvaultizabilityTableCount,
      idempotencyKeysTableExists: operabilityvaultizabilityTableCoverage.idempotencyKeysTableExists,
      usageEventsTableExists: operabilityvaultizabilityTableCoverage.usageEventsTableExists,
      billingWebhookEventsTableExists: operabilityvaultizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return operabilityvaultizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceOperabilityvaultizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageOperabilityvaultizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.operabilityvaultizabilityStatusService.getWorkspaceOperabilityvaultizabilityInventory(
        workspaceId,
      )
    const records = buildOperabilityvaultizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.operabilityvaultizabilityStatusService.pingPostgres()
    const stats = buildOperabilityvaultizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return operabilityvaultizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveOperabilityvaultizabilityAdminActions(),
      guidance: getOperabilityvaultizabilityAdminGuidance({ stats }),
    })
  }

  async executeOperabilityvaultizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_operabilityvaultizability_summary'
    },
  ) {
    this.assertCanManageOperabilityvaultizability(authContext)

    const payload = operabilityvaultizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_operabilityvaultizability_summary': {
        const summary = await this.getWorkspaceOperabilityvaultizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return operabilityvaultizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed operabilityvaultizability summary with ${summary.stats.operabilityvaultizabilityPercent}% idempotency key operabilityvaultizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageOperabilityvaultizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production operabilityvaultizability tools.',
    })
  }
}
