import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getDetectabilityRolloutGuidance,
  detectabilityAdminActionRequestSchema,
  detectabilityAdminActionResponseSchema,
  detectabilityAdminSummaryResponseSchema,
  detectabilityCapabilitiesResponseSchema,
  detectabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildDetectabilityAdminRecords,
  buildDetectabilityAdminStats,
  getDetectabilityAdminGuidance,
  resolveDetectabilityAdminActions,
} from './detectability-admin.helpers.js'
import { evaluateDetectabilityRollout } from './detectability-rollout.helpers.js'
import { DetectabilityStatusService } from './detectability-status.service.js'

@Injectable()
export class DetectabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly detectabilityStatusService: DetectabilityStatusService,
  ) {}

  getCapabilities() {
    return detectabilityCapabilitiesResponseSchema.parse({
      supportsDetectabilityRollout: true,
      supportsDetectabilityAdminTools: true,
      supportsBillingWebhookDetectabilitySignals: true,
      supportsBillingNotificationDetectabilitySignals: true,
      guidance: getDetectabilityRolloutGuidance(),
    })
  }

  async getDetectabilityRollout() {
    const detectabilityTableCoverage =
      await this.detectabilityStatusService.getDetectabilityTableCoverage()

    const rollout = evaluateDetectabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.detectabilityStatusService.pingPostgres(),
      existingDetectabilityTableCount: detectabilityTableCoverage.existingDetectabilityTableCount,
      billingWebhookEventsTableExists: detectabilityTableCoverage.billingWebhookEventsTableExists,
      billingNotificationsTableExists: detectabilityTableCoverage.billingNotificationsTableExists,
      idempotencyKeysTableExists: detectabilityTableCoverage.idempotencyKeysTableExists,
    })

    return detectabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceDetectabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageDetectability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.detectabilityStatusService.getWorkspaceDetectabilityInventory(
        workspaceId,
      )
    const records = buildDetectabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.detectabilityStatusService.pingPostgres()
    const stats = buildDetectabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return detectabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveDetectabilityAdminActions(),
      guidance: getDetectabilityAdminGuidance({ stats }),
    })
  }

  async executeDetectabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_detectability_summary'
    },
  ) {
    this.assertCanManageDetectability(authContext)

    const payload = detectabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_detectability_summary': {
        const summary = await this.getWorkspaceDetectabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return detectabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed detectability summary with ${summary.stats.detectabilityPercent}% billing webhook detectability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageDetectability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production detectability tools.',
    })
  }
}
