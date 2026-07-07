import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getForensicizabilityRolloutGuidance,
  forensicizabilityAdminActionRequestSchema,
  forensicizabilityAdminActionResponseSchema,
  forensicizabilityAdminSummaryResponseSchema,
  forensicizabilityCapabilitiesResponseSchema,
  forensicizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildForensicizabilityAdminRecords,
  buildForensicizabilityAdminStats,
  getForensicizabilityAdminGuidance,
  resolveForensicizabilityAdminActions,
} from './forensicizability-admin.helpers.js'
import { evaluateForensicizabilityRollout } from './forensicizability-rollout.helpers.js'
import { ForensicizabilityStatusService } from './forensicizability-status.service.js'

@Injectable()
export class ForensicizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly forensicizabilityStatusService: ForensicizabilityStatusService,
  ) {}

  getCapabilities() {
    return forensicizabilityCapabilitiesResponseSchema.parse({
      supportsForensicizabilityRollout: true,
      supportsForensicizabilityAdminTools: true,
      supportsIdempotencyKeyForensicizabilitySignals: true,
      supportsUsageEventForensicizabilitySignals: true,
      guidance: getForensicizabilityRolloutGuidance(),
    })
  }

  async getForensicizabilityRollout() {
    const forensicizabilityTableCoverage =
      await this.forensicizabilityStatusService.getForensicizabilityTableCoverage()

    const rollout = evaluateForensicizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.forensicizabilityStatusService.pingPostgres(),
      existingForensicizabilityTableCount: forensicizabilityTableCoverage.existingForensicizabilityTableCount,
      idempotencyKeysTableExists: forensicizabilityTableCoverage.idempotencyKeysTableExists,
      usageEventsTableExists: forensicizabilityTableCoverage.usageEventsTableExists,
      billingWebhookEventsTableExists: forensicizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return forensicizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceForensicizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageForensicizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.forensicizabilityStatusService.getWorkspaceForensicizabilityInventory(
        workspaceId,
      )
    const records = buildForensicizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.forensicizabilityStatusService.pingPostgres()
    const stats = buildForensicizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return forensicizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveForensicizabilityAdminActions(),
      guidance: getForensicizabilityAdminGuidance({ stats }),
    })
  }

  async executeForensicizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_forensicizability_summary'
    },
  ) {
    this.assertCanManageForensicizability(authContext)

    const payload = forensicizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_forensicizability_summary': {
        const summary = await this.getWorkspaceForensicizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return forensicizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed forensicizability summary with ${summary.stats.forensicizabilityPercent}% idempotency key forensicizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageForensicizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production forensicizability tools.',
    })
  }
}
