import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getAccessibilityRolloutGuidance,
  accessibilityAdminActionRequestSchema,
  accessibilityAdminActionResponseSchema,
  accessibilityAdminSummaryResponseSchema,
  accessibilityCapabilitiesResponseSchema,
  accessibilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildAccessibilityAdminRecords,
  buildAccessibilityAdminStats,
  getAccessibilityAdminGuidance,
  resolveAccessibilityAdminActions,
} from './accessibility-admin.helpers.js'
import { evaluateAccessibilityRollout } from './accessibility-rollout.helpers.js'
import { AccessibilityStatusService } from './accessibility-status.service.js'

@Injectable()
export class AccessibilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly accessibilityStatusService: AccessibilityStatusService,
  ) {}

  getCapabilities() {
    return accessibilityCapabilitiesResponseSchema.parse({
      supportsAccessibilityRollout: true,
      supportsAccessibilityAdminTools: true,
      supportsIdempotencyKeyAccessibilitySignals: true,
      supportsUsageEventAccessibilitySignals: true,
      guidance: getAccessibilityRolloutGuidance(),
    })
  }

  async getAccessibilityRollout() {
    const accessibilityTableCoverage =
      await this.accessibilityStatusService.getAccessibilityTableCoverage()

    const rollout = evaluateAccessibilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.accessibilityStatusService.pingPostgres(),
      existingAccessibilityTableCount: accessibilityTableCoverage.existingAccessibilityTableCount,
      idempotencyKeysTableExists: accessibilityTableCoverage.idempotencyKeysTableExists,
      usageEventsTableExists: accessibilityTableCoverage.usageEventsTableExists,
      billingWebhookEventsTableExists: accessibilityTableCoverage.billingWebhookEventsTableExists,
    })

    return accessibilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceAccessibilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageAccessibility(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.accessibilityStatusService.getWorkspaceAccessibilityInventory(
        workspaceId,
      )
    const records = buildAccessibilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.accessibilityStatusService.pingPostgres()
    const stats = buildAccessibilityAdminStats({
      records,
      postgresConnectivity,
    })

    return accessibilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveAccessibilityAdminActions(),
      guidance: getAccessibilityAdminGuidance({ stats }),
    })
  }

  async executeAccessibilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_accessibility_summary'
    },
  ) {
    this.assertCanManageAccessibility(authContext)

    const payload = accessibilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_accessibility_summary': {
        const summary = await this.getWorkspaceAccessibilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return accessibilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed accessibility summary with ${summary.stats.accessibilityPercent}% idempotency key accessibility across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageAccessibility(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production accessibility tools.',
    })
  }
}
