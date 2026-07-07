import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getRemediationizabilityRolloutGuidance,
  remediationizabilityAdminActionRequestSchema,
  remediationizabilityAdminActionResponseSchema,
  remediationizabilityAdminSummaryResponseSchema,
  remediationizabilityCapabilitiesResponseSchema,
  remediationizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildRemediationizabilityAdminRecords,
  buildRemediationizabilityAdminStats,
  getRemediationizabilityAdminGuidance,
  resolveRemediationizabilityAdminActions,
} from './remediationizability-admin.helpers.js'
import { evaluateRemediationizabilityRollout } from './remediationizability-rollout.helpers.js'
import { RemediationizabilityStatusService } from './remediationizability-status.service.js'

@Injectable()
export class RemediationizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly remediationizabilityStatusService: RemediationizabilityStatusService,
  ) {}

  getCapabilities() {
    return remediationizabilityCapabilitiesResponseSchema.parse({
      supportsRemediationizabilityRollout: true,
      supportsRemediationizabilityAdminTools: true,
      supportsIdempotencyKeyRemediationizabilitySignals: true,
      supportsUsageEventRemediationizabilitySignals: true,
      guidance: getRemediationizabilityRolloutGuidance(),
    })
  }

  async getRemediationizabilityRollout() {
    const remediationizabilityTableCoverage =
      await this.remediationizabilityStatusService.getRemediationizabilityTableCoverage()

    const rollout = evaluateRemediationizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.remediationizabilityStatusService.pingPostgres(),
      existingRemediationizabilityTableCount: remediationizabilityTableCoverage.existingRemediationizabilityTableCount,
      idempotencyKeysTableExists: remediationizabilityTableCoverage.idempotencyKeysTableExists,
      usageEventsTableExists: remediationizabilityTableCoverage.usageEventsTableExists,
      billingWebhookEventsTableExists: remediationizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return remediationizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceRemediationizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageRemediationizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.remediationizabilityStatusService.getWorkspaceRemediationizabilityInventory(
        workspaceId,
      )
    const records = buildRemediationizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.remediationizabilityStatusService.pingPostgres()
    const stats = buildRemediationizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return remediationizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveRemediationizabilityAdminActions(),
      guidance: getRemediationizabilityAdminGuidance({ stats }),
    })
  }

  async executeRemediationizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_remediationizability_summary'
    },
  ) {
    this.assertCanManageRemediationizability(authContext)

    const payload = remediationizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_remediationizability_summary': {
        const summary = await this.getWorkspaceRemediationizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return remediationizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed remediationizability summary with ${summary.stats.remediationizabilityPercent}% idempotency key remediationizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageRemediationizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production remediationizability tools.',
    })
  }
}
