import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getPrivacyizabilityRolloutGuidance,
  privacyizabilityAdminActionRequestSchema,
  privacyizabilityAdminActionResponseSchema,
  privacyizabilityAdminSummaryResponseSchema,
  privacyizabilityCapabilitiesResponseSchema,
  privacyizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildPrivacyizabilityAdminRecords,
  buildPrivacyizabilityAdminStats,
  getPrivacyizabilityAdminGuidance,
  resolvePrivacyizabilityAdminActions,
} from './privacyizability-admin.helpers.js'
import { evaluatePrivacyizabilityRollout } from './privacyizability-rollout.helpers.js'
import { PrivacyizabilityStatusService } from './privacyizability-status.service.js'

@Injectable()
export class PrivacyizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly privacyizabilityStatusService: PrivacyizabilityStatusService,
  ) {}

  getCapabilities() {
    return privacyizabilityCapabilitiesResponseSchema.parse({
      supportsPrivacyizabilityRollout: true,
      supportsPrivacyizabilityAdminTools: true,
      supportsIdempotencyKeyPrivacyizabilitySignals: true,
      supportsUsageEventPrivacyizabilitySignals: true,
      guidance: getPrivacyizabilityRolloutGuidance(),
    })
  }

  async getPrivacyizabilityRollout() {
    const privacyizabilityTableCoverage =
      await this.privacyizabilityStatusService.getPrivacyizabilityTableCoverage()

    const rollout = evaluatePrivacyizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.privacyizabilityStatusService.pingPostgres(),
      existingPrivacyizabilityTableCount: privacyizabilityTableCoverage.existingPrivacyizabilityTableCount,
      idempotencyKeysTableExists: privacyizabilityTableCoverage.idempotencyKeysTableExists,
      usageEventsTableExists: privacyizabilityTableCoverage.usageEventsTableExists,
      billingWebhookEventsTableExists: privacyizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return privacyizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspacePrivacyizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManagePrivacyizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.privacyizabilityStatusService.getWorkspacePrivacyizabilityInventory(
        workspaceId,
      )
    const records = buildPrivacyizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.privacyizabilityStatusService.pingPostgres()
    const stats = buildPrivacyizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return privacyizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolvePrivacyizabilityAdminActions(),
      guidance: getPrivacyizabilityAdminGuidance({ stats }),
    })
  }

  async executePrivacyizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_privacyizability_summary'
    },
  ) {
    this.assertCanManagePrivacyizability(authContext)

    const payload = privacyizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_privacyizability_summary': {
        const summary = await this.getWorkspacePrivacyizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return privacyizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed privacyizability summary with ${summary.stats.privacyizabilityPercent}% idempotency key privacyizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManagePrivacyizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production privacyizability tools.',
    })
  }
}
