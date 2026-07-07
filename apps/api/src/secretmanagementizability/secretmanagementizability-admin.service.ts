import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getSecretmanagementizabilityRolloutGuidance,
  secretmanagementizabilityAdminActionRequestSchema,
  secretmanagementizabilityAdminActionResponseSchema,
  secretmanagementizabilityAdminSummaryResponseSchema,
  secretmanagementizabilityCapabilitiesResponseSchema,
  secretmanagementizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildSecretmanagementizabilityAdminRecords,
  buildSecretmanagementizabilityAdminStats,
  getSecretmanagementizabilityAdminGuidance,
  resolveSecretmanagementizabilityAdminActions,
} from './secretmanagementizability-admin.helpers.js'
import { evaluateSecretmanagementizabilityRollout } from './secretmanagementizability-rollout.helpers.js'
import { SecretmanagementizabilityStatusService } from './secretmanagementizability-status.service.js'

@Injectable()
export class SecretmanagementizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly secretmanagementizabilityStatusService: SecretmanagementizabilityStatusService,
  ) {}

  getCapabilities() {
    return secretmanagementizabilityCapabilitiesResponseSchema.parse({
      supportsSecretmanagementizabilityRollout: true,
      supportsSecretmanagementizabilityAdminTools: true,
      supportsIdempotencyKeySecretmanagementizabilitySignals: true,
      supportsUsageEventSecretmanagementizabilitySignals: true,
      guidance: getSecretmanagementizabilityRolloutGuidance(),
    })
  }

  async getSecretmanagementizabilityRollout() {
    const secretmanagementizabilityTableCoverage =
      await this.secretmanagementizabilityStatusService.getSecretmanagementizabilityTableCoverage()

    const rollout = evaluateSecretmanagementizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.secretmanagementizabilityStatusService.pingPostgres(),
      existingSecretmanagementizabilityTableCount: secretmanagementizabilityTableCoverage.existingSecretmanagementizabilityTableCount,
      idempotencyKeysTableExists: secretmanagementizabilityTableCoverage.idempotencyKeysTableExists,
      usageEventsTableExists: secretmanagementizabilityTableCoverage.usageEventsTableExists,
      billingWebhookEventsTableExists: secretmanagementizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return secretmanagementizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceSecretmanagementizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageSecretmanagementizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.secretmanagementizabilityStatusService.getWorkspaceSecretmanagementizabilityInventory(
        workspaceId,
      )
    const records = buildSecretmanagementizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.secretmanagementizabilityStatusService.pingPostgres()
    const stats = buildSecretmanagementizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return secretmanagementizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveSecretmanagementizabilityAdminActions(),
      guidance: getSecretmanagementizabilityAdminGuidance({ stats }),
    })
  }

  async executeSecretmanagementizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_secretmanagementizability_summary'
    },
  ) {
    this.assertCanManageSecretmanagementizability(authContext)

    const payload = secretmanagementizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_secretmanagementizability_summary': {
        const summary = await this.getWorkspaceSecretmanagementizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return secretmanagementizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed secretmanagementizability summary with ${summary.stats.secretmanagementizabilityPercent}% idempotency key secretmanagementizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageSecretmanagementizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production secretmanagementizability tools.',
    })
  }
}
