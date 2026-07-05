import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getApproximatizabilityRolloutGuidance,
  approximatizabilityAdminActionRequestSchema,
  approximatizabilityAdminActionResponseSchema,
  approximatizabilityAdminSummaryResponseSchema,
  approximatizabilityCapabilitiesResponseSchema,
  approximatizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildApproximatizabilityAdminRecords,
  buildApproximatizabilityAdminStats,
  getApproximatizabilityAdminGuidance,
  resolveApproximatizabilityAdminActions,
} from './approximatizability-admin.helpers.js'
import { evaluateApproximatizabilityRollout } from './approximatizability-rollout.helpers.js'
import { ApproximatizabilityStatusService } from './approximatizability-status.service.js'

@Injectable()
export class ApproximatizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly approximatizabilityStatusService: ApproximatizabilityStatusService,
  ) {}

  getCapabilities() {
    return approximatizabilityCapabilitiesResponseSchema.parse({
      supportsApproximatizabilityRollout: true,
      supportsApproximatizabilityAdminTools: true,
      supportsBillingWebhookApproximatizabilitySignals: true,
      supportsBillingRecordApproximatizabilitySignals: true,
      guidance: getApproximatizabilityRolloutGuidance(),
    })
  }

  async getApproximatizabilityRollout() {
    const approximatizabilityTableCoverage =
      await this.approximatizabilityStatusService.getApproximatizabilityTableCoverage()

    const rollout = evaluateApproximatizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.approximatizabilityStatusService.pingPostgres(),
      existingApproximatizabilityTableCount: approximatizabilityTableCoverage.existingApproximatizabilityTableCount,
      billingWebhookEventsTableExists: approximatizabilityTableCoverage.billingWebhookEventsTableExists,
      billingRecordsTableExists: approximatizabilityTableCoverage.billingRecordsTableExists,
      usageEventsTableExists: approximatizabilityTableCoverage.usageEventsTableExists,
    })

    return approximatizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceApproximatizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageApproximatizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.approximatizabilityStatusService.getWorkspaceApproximatizabilityInventory(
        workspaceId,
      )
    const records = buildApproximatizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.approximatizabilityStatusService.pingPostgres()
    const stats = buildApproximatizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return approximatizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveApproximatizabilityAdminActions(),
      guidance: getApproximatizabilityAdminGuidance({ stats }),
    })
  }

  async executeApproximatizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_approximatizability_summary'
    },
  ) {
    this.assertCanManageApproximatizability(authContext)

    const payload = approximatizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_approximatizability_summary': {
        const summary = await this.getWorkspaceApproximatizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return approximatizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed approximatizability summary with ${summary.stats.approximatizabilityPercent}% billing webhook approximatizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageApproximatizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production approximatizability tools.',
    })
  }
}
