import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getAuthorizationizabilityRolloutGuidance,
  authorizationizabilityAdminActionRequestSchema,
  authorizationizabilityAdminActionResponseSchema,
  authorizationizabilityAdminSummaryResponseSchema,
  authorizationizabilityCapabilitiesResponseSchema,
  authorizationizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildAuthorizationizabilityAdminRecords,
  buildAuthorizationizabilityAdminStats,
  getAuthorizationizabilityAdminGuidance,
  resolveAuthorizationizabilityAdminActions,
} from './authorizationizability-admin.helpers.js'
import { evaluateAuthorizationizabilityRollout } from './authorizationizability-rollout.helpers.js'
import { AuthorizationizabilityStatusService } from './authorizationizability-status.service.js'

@Injectable()
export class AuthorizationizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly authorizationizabilityStatusService: AuthorizationizabilityStatusService,
  ) {}

  getCapabilities() {
    return authorizationizabilityCapabilitiesResponseSchema.parse({
      supportsAuthorizationizabilityRollout: true,
      supportsAuthorizationizabilityAdminTools: true,
      supportsIdempotencyKeyAuthorizationizabilitySignals: true,
      supportsUsageEventAuthorizationizabilitySignals: true,
      guidance: getAuthorizationizabilityRolloutGuidance(),
    })
  }

  async getAuthorizationizabilityRollout() {
    const authorizationizabilityTableCoverage =
      await this.authorizationizabilityStatusService.getAuthorizationizabilityTableCoverage()

    const rollout = evaluateAuthorizationizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.authorizationizabilityStatusService.pingPostgres(),
      existingAuthorizationizabilityTableCount: authorizationizabilityTableCoverage.existingAuthorizationizabilityTableCount,
      idempotencyKeysTableExists: authorizationizabilityTableCoverage.idempotencyKeysTableExists,
      usageEventsTableExists: authorizationizabilityTableCoverage.usageEventsTableExists,
      billingWebhookEventsTableExists: authorizationizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return authorizationizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceAuthorizationizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageAuthorizationizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.authorizationizabilityStatusService.getWorkspaceAuthorizationizabilityInventory(
        workspaceId,
      )
    const records = buildAuthorizationizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.authorizationizabilityStatusService.pingPostgres()
    const stats = buildAuthorizationizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return authorizationizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveAuthorizationizabilityAdminActions(),
      guidance: getAuthorizationizabilityAdminGuidance({ stats }),
    })
  }

  async executeAuthorizationizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_authorizationizability_summary'
    },
  ) {
    this.assertCanManageAuthorizationizability(authContext)

    const payload = authorizationizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_authorizationizability_summary': {
        const summary = await this.getWorkspaceAuthorizationizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return authorizationizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed authorizationizability summary with ${summary.stats.authorizationizabilityPercent}% idempotency key authorizationizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageAuthorizationizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production authorizationizability tools.',
    })
  }
}
