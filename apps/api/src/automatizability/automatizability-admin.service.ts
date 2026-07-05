import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getAutomatizabilityRolloutGuidance,
  automatizabilityAdminActionRequestSchema,
  automatizabilityAdminActionResponseSchema,
  automatizabilityAdminSummaryResponseSchema,
  automatizabilityCapabilitiesResponseSchema,
  automatizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildAutomatizabilityAdminRecords,
  buildAutomatizabilityAdminStats,
  getAutomatizabilityAdminGuidance,
  resolveAutomatizabilityAdminActions,
} from './automatizability-admin.helpers.js'
import { evaluateAutomatizabilityRollout } from './automatizability-rollout.helpers.js'
import { AutomatizabilityStatusService } from './automatizability-status.service.js'

@Injectable()
export class AutomatizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly automatizabilityStatusService: AutomatizabilityStatusService,
  ) {}

  getCapabilities() {
    return automatizabilityCapabilitiesResponseSchema.parse({
      supportsAutomatizabilityRollout: true,
      supportsAutomatizabilityAdminTools: true,
      supportsIdempotencyKeyAutomatizabilitySignals: true,
      supportsUsageEventAutomatizabilitySignals: true,
      guidance: getAutomatizabilityRolloutGuidance(),
    })
  }

  async getAutomatizabilityRollout() {
    const automatizabilityTableCoverage =
      await this.automatizabilityStatusService.getAutomatizabilityTableCoverage()

    const rollout = evaluateAutomatizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.automatizabilityStatusService.pingPostgres(),
      existingAutomatizabilityTableCount: automatizabilityTableCoverage.existingAutomatizabilityTableCount,
      idempotencyKeysTableExists: automatizabilityTableCoverage.idempotencyKeysTableExists,
      usageEventsTableExists: automatizabilityTableCoverage.usageEventsTableExists,
      billingWebhookEventsTableExists: automatizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return automatizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceAutomatizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageAutomatizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.automatizabilityStatusService.getWorkspaceAutomatizabilityInventory(
        workspaceId,
      )
    const records = buildAutomatizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.automatizabilityStatusService.pingPostgres()
    const stats = buildAutomatizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return automatizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveAutomatizabilityAdminActions(),
      guidance: getAutomatizabilityAdminGuidance({ stats }),
    })
  }

  async executeAutomatizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_automatizability_summary'
    },
  ) {
    this.assertCanManageAutomatizability(authContext)

    const payload = automatizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_automatizability_summary': {
        const summary = await this.getWorkspaceAutomatizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return automatizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed automatizability summary with ${summary.stats.automatizabilityPercent}% idempotency key automatizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageAutomatizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production automatizability tools.',
    })
  }
}
