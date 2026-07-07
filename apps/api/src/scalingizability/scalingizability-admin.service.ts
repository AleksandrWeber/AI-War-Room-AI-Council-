import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getScalingizabilityRolloutGuidance,
  scalingizabilityAdminActionRequestSchema,
  scalingizabilityAdminActionResponseSchema,
  scalingizabilityAdminSummaryResponseSchema,
  scalingizabilityCapabilitiesResponseSchema,
  scalingizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildScalingizabilityAdminRecords,
  buildScalingizabilityAdminStats,
  getScalingizabilityAdminGuidance,
  resolveScalingizabilityAdminActions,
} from './scalingizability-admin.helpers.js'
import { evaluateScalingizabilityRollout } from './scalingizability-rollout.helpers.js'
import { ScalingizabilityStatusService } from './scalingizability-status.service.js'

@Injectable()
export class ScalingizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly scalingizabilityStatusService: ScalingizabilityStatusService,
  ) {}

  getCapabilities() {
    return scalingizabilityCapabilitiesResponseSchema.parse({
      supportsScalingizabilityRollout: true,
      supportsScalingizabilityAdminTools: true,
      supportsBillingInvoiceScalingizabilitySignals: true,
      supportsBillingRecordScalingizabilitySignals: true,
      guidance: getScalingizabilityRolloutGuidance(),
    })
  }

  async getScalingizabilityRollout() {
    const scalingizabilityTableCoverage =
      await this.scalingizabilityStatusService.getScalingizabilityTableCoverage()

    const rollout = evaluateScalingizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.scalingizabilityStatusService.pingPostgres(),
      existingScalingizabilityTableCount: scalingizabilityTableCoverage.existingScalingizabilityTableCount,
      billingInvoicesTableExists: scalingizabilityTableCoverage.billingInvoicesTableExists,
      billingRecordsTableExists: scalingizabilityTableCoverage.billingRecordsTableExists,
      billingWebhookEventsTableExists: scalingizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return scalingizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceScalingizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageScalingizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.scalingizabilityStatusService.getWorkspaceScalingizabilityInventory(
        workspaceId,
      )
    const records = buildScalingizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.scalingizabilityStatusService.pingPostgres()
    const stats = buildScalingizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return scalingizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveScalingizabilityAdminActions(),
      guidance: getScalingizabilityAdminGuidance({ stats }),
    })
  }

  async executeScalingizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_scalingizability_summary'
    },
  ) {
    this.assertCanManageScalingizability(authContext)

    const payload = scalingizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_scalingizability_summary': {
        const summary = await this.getWorkspaceScalingizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return scalingizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed scalingizability summary with ${summary.stats.scalingizabilityPercent}% billing invoice scalingizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageScalingizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production scalingizability tools.',
    })
  }
}
