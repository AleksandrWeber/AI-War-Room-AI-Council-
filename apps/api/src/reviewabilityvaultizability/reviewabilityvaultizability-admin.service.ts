import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getReviewabilityvaultizabilityRolloutGuidance,
  reviewabilityvaultizabilityAdminActionRequestSchema,
  reviewabilityvaultizabilityAdminActionResponseSchema,
  reviewabilityvaultizabilityAdminSummaryResponseSchema,
  reviewabilityvaultizabilityCapabilitiesResponseSchema,
  reviewabilityvaultizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildReviewabilityvaultizabilityAdminRecords,
  buildReviewabilityvaultizabilityAdminStats,
  getReviewabilityvaultizabilityAdminGuidance,
  resolveReviewabilityvaultizabilityAdminActions,
} from './reviewabilityvaultizability-admin.helpers.js'
import { evaluateReviewabilityvaultizabilityRollout } from './reviewabilityvaultizability-rollout.helpers.js'
import { ReviewabilityvaultizabilityStatusService } from './reviewabilityvaultizability-status.service.js'

@Injectable()
export class ReviewabilityvaultizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly reviewabilityvaultizabilityStatusService: ReviewabilityvaultizabilityStatusService,
  ) {}

  getCapabilities() {
    return reviewabilityvaultizabilityCapabilitiesResponseSchema.parse({
      supportsReviewabilityvaultizabilityRollout: true,
      supportsReviewabilityvaultizabilityAdminTools: true,
      supportsBillingNotificationReviewabilityvaultizabilitySignals: true,
      supportsBillingWebhookReviewabilityvaultizabilitySignals: true,
      guidance: getReviewabilityvaultizabilityRolloutGuidance(),
    })
  }

  async getReviewabilityvaultizabilityRollout() {
    const reviewabilityvaultizabilityTableCoverage =
      await this.reviewabilityvaultizabilityStatusService.getReviewabilityvaultizabilityTableCoverage()

    const rollout = evaluateReviewabilityvaultizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.reviewabilityvaultizabilityStatusService.pingPostgres(),
      existingReviewabilityvaultizabilityTableCount: reviewabilityvaultizabilityTableCoverage.existingReviewabilityvaultizabilityTableCount,
      billingNotificationsTableExists: reviewabilityvaultizabilityTableCoverage.billingNotificationsTableExists,
      billingWebhookEventsTableExists: reviewabilityvaultizabilityTableCoverage.billingWebhookEventsTableExists,
      usageEventsTableExists: reviewabilityvaultizabilityTableCoverage.usageEventsTableExists,
    })

    return reviewabilityvaultizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceReviewabilityvaultizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageReviewabilityvaultizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.reviewabilityvaultizabilityStatusService.getWorkspaceReviewabilityvaultizabilityInventory(
        workspaceId,
      )
    const records = buildReviewabilityvaultizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.reviewabilityvaultizabilityStatusService.pingPostgres()
    const stats = buildReviewabilityvaultizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return reviewabilityvaultizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveReviewabilityvaultizabilityAdminActions(),
      guidance: getReviewabilityvaultizabilityAdminGuidance({ stats }),
    })
  }

  async executeReviewabilityvaultizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_reviewabilityvaultizability_summary'
    },
  ) {
    this.assertCanManageReviewabilityvaultizability(authContext)

    const payload = reviewabilityvaultizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_reviewabilityvaultizability_summary': {
        const summary = await this.getWorkspaceReviewabilityvaultizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return reviewabilityvaultizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed reviewabilityvaultizability summary with ${summary.stats.reviewabilityvaultizabilityPercent}% billing notification reviewabilityvaultizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageReviewabilityvaultizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production reviewabilityvaultizability tools.',
    })
  }
}
