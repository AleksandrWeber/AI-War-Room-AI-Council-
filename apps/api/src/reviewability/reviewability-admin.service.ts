import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getReviewabilityRolloutGuidance,
  reviewabilityAdminActionRequestSchema,
  reviewabilityAdminActionResponseSchema,
  reviewabilityAdminSummaryResponseSchema,
  reviewabilityCapabilitiesResponseSchema,
  reviewabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildReviewabilityAdminRecords,
  buildReviewabilityAdminStats,
  getReviewabilityAdminGuidance,
  resolveReviewabilityAdminActions,
} from './reviewability-admin.helpers.js'
import { evaluateReviewabilityRollout } from './reviewability-rollout.helpers.js'
import { ReviewabilityStatusService } from './reviewability-status.service.js'

@Injectable()
export class ReviewabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly reviewabilityStatusService: ReviewabilityStatusService,
  ) {}

  getCapabilities() {
    return reviewabilityCapabilitiesResponseSchema.parse({
      supportsReviewabilityRollout: true,
      supportsReviewabilityAdminTools: true,
      supportsArtifactReviewabilitySignals: true,
      supportsAgentOutputReviewabilitySignals: true,
      guidance: getReviewabilityRolloutGuidance(),
    })
  }

  async getReviewabilityRollout() {
    const reviewabilityTableCoverage =
      await this.reviewabilityStatusService.getReviewabilityTableCoverage()

    const rollout = evaluateReviewabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.reviewabilityStatusService.pingPostgres(),
      existingReviewabilityTableCount: reviewabilityTableCoverage.existingReviewabilityTableCount,
      artifactsTableExists: reviewabilityTableCoverage.artifactsTableExists,
      agentOutputsTableExists: reviewabilityTableCoverage.agentOutputsTableExists,
      billingInvoicesTableExists: reviewabilityTableCoverage.billingInvoicesTableExists,
    })

    return reviewabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceReviewabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageReviewability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.reviewabilityStatusService.getWorkspaceReviewabilityInventory(
        workspaceId,
      )
    const records = buildReviewabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.reviewabilityStatusService.pingPostgres()
    const stats = buildReviewabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return reviewabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveReviewabilityAdminActions(),
      guidance: getReviewabilityAdminGuidance({ stats }),
    })
  }

  async executeReviewabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_reviewability_summary'
    },
  ) {
    this.assertCanManageReviewability(authContext)

    const payload = reviewabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_reviewability_summary': {
        const summary = await this.getWorkspaceReviewabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return reviewabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed reviewability summary with ${summary.stats.reviewabilityPercent}% artifact reviewability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageReviewability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production reviewability tools.',
    })
  }
}
