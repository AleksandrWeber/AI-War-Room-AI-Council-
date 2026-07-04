import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getShieldRolloutGuidance,
  shieldCapabilitiesResponseSchema,
  shieldReviewAdminActionRequestSchema,
  shieldReviewAdminActionResponseSchema,
  shieldReviewAdminSummaryResponseSchema,
  shieldRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import { AdvancedShieldService } from './advanced-shield.service.js'
import { shieldAdversarialDataset } from './shield-adversarial.dataset.js'
import { shieldFalsePositiveReviewSet } from './shield-review-set.js'
import {
  buildShieldReviewAdminStats,
  getShieldReviewAdminGuidance,
  resolveShieldReviewAdminActions,
  toShieldReviewAdminCases,
} from './shield-review-admin.helpers.js'
import { evaluateShieldRollout } from './shield-rollout.helpers.js'

@Injectable()
export class ShieldAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly advancedShieldService: AdvancedShieldService,
  ) {}

  getCapabilities() {
    return this.advancedShieldService.getReviewSummary().then((reviewSummary) =>
      shieldCapabilitiesResponseSchema.parse({
        classifierId: reviewSummary.classifierId,
        supportsShieldRollout: true,
        supportsShieldReviewAdminTools: true,
        guidance: getShieldRolloutGuidance({
          classifierId: reviewSummary.classifierId,
        }),
      }),
    )
  }

  async getShieldRollout() {
    const reviewSummary = await this.advancedShieldService.getReviewSummary()
    const rollout = evaluateShieldRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      classifierId: reviewSummary.classifierId,
      reviewSummary,
      reviewSetCaseCount: shieldFalsePositiveReviewSet.length,
      adversarialCaseCount: shieldAdversarialDataset.length,
    })

    return shieldRolloutResponseSchema.parse({
      ...rollout,
      classifierId: reviewSummary.classifierId,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceShieldReviewAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageShieldReview(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const reviewSummary = await this.advancedShieldService.getReviewSummary()
    const stats = buildShieldReviewAdminStats(reviewSummary)
    const availableActions = resolveShieldReviewAdminActions({ stats })

    return shieldReviewAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      classifierId: reviewSummary.classifierId,
      cases: toShieldReviewAdminCases(reviewSummary),
      stats,
      availableActions,
      guidance: getShieldReviewAdminGuidance({ stats }),
    })
  }

  async executeShieldReviewAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'rerun_review_summary'
    },
  ) {
    this.assertCanManageShieldReview(authContext)

    const payload = shieldReviewAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'rerun_review_summary': {
        const reviewSummary = await this.advancedShieldService.getReviewSummary()
        const stats = buildShieldReviewAdminStats(reviewSummary)

        return shieldReviewAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message:
            stats.falsePositiveCount === 0
              ? `Reran Shield review summary for ${stats.totalCases} cases with no false positives.`
              : `Reran Shield review summary and found ${stats.falsePositiveCount} false positive(s).`,
          stats,
        })
      }
    }
  }

  async getReviewSummaryAsAdmin(authContext: AuthContext) {
    this.assertCanManageShieldReview(authContext)

    return this.advancedShieldService.getReviewSummary()
  }

  private assertCanManageShieldReview(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message: 'Only workspace owners and admins can manage Shield review tools.',
    })
  }
}
