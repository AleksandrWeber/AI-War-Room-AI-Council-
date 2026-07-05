import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getJoinizabilityRolloutGuidance,
  joinizabilityAdminActionRequestSchema,
  joinizabilityAdminActionResponseSchema,
  joinizabilityAdminSummaryResponseSchema,
  joinizabilityCapabilitiesResponseSchema,
  joinizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildJoinizabilityAdminRecords,
  buildJoinizabilityAdminStats,
  getJoinizabilityAdminGuidance,
  resolveJoinizabilityAdminActions,
} from './joinizability-admin.helpers.js'
import { evaluateJoinizabilityRollout } from './joinizability-rollout.helpers.js'
import { JoinizabilityStatusService } from './joinizability-status.service.js'

@Injectable()
export class JoinizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly joinizabilityStatusService: JoinizabilityStatusService,
  ) {}

  getCapabilities() {
    return joinizabilityCapabilitiesResponseSchema.parse({
      supportsJoinizabilityRollout: true,
      supportsJoinizabilityAdminTools: true,
      supportsIdempotencyKeyJoinizabilitySignals: true,
      supportsUsageEventJoinizabilitySignals: true,
      guidance: getJoinizabilityRolloutGuidance(),
    })
  }

  async getJoinizabilityRollout() {
    const joinizabilityTableCoverage =
      await this.joinizabilityStatusService.getJoinizabilityTableCoverage()

    const rollout = evaluateJoinizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.joinizabilityStatusService.pingPostgres(),
      existingJoinizabilityTableCount: joinizabilityTableCoverage.existingJoinizabilityTableCount,
      idempotencyKeysTableExists: joinizabilityTableCoverage.idempotencyKeysTableExists,
      usageEventsTableExists: joinizabilityTableCoverage.usageEventsTableExists,
      billingWebhookEventsTableExists: joinizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return joinizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceJoinizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageJoinizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.joinizabilityStatusService.getWorkspaceJoinizabilityInventory(
        workspaceId,
      )
    const records = buildJoinizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.joinizabilityStatusService.pingPostgres()
    const stats = buildJoinizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return joinizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveJoinizabilityAdminActions(),
      guidance: getJoinizabilityAdminGuidance({ stats }),
    })
  }

  async executeJoinizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_joinizability_summary'
    },
  ) {
    this.assertCanManageJoinizability(authContext)

    const payload = joinizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_joinizability_summary': {
        const summary = await this.getWorkspaceJoinizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return joinizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed joinizability summary with ${summary.stats.joinizabilityPercent}% idempotency key joinizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageJoinizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production joinizability tools.',
    })
  }
}
