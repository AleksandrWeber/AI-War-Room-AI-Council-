import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getInterpolizabilityRolloutGuidance,
  interpolizabilityAdminActionRequestSchema,
  interpolizabilityAdminActionResponseSchema,
  interpolizabilityAdminSummaryResponseSchema,
  interpolizabilityCapabilitiesResponseSchema,
  interpolizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildInterpolizabilityAdminRecords,
  buildInterpolizabilityAdminStats,
  getInterpolizabilityAdminGuidance,
  resolveInterpolizabilityAdminActions,
} from './interpolizability-admin.helpers.js'
import { evaluateInterpolizabilityRollout } from './interpolizability-rollout.helpers.js'
import { InterpolizabilityStatusService } from './interpolizability-status.service.js'

@Injectable()
export class InterpolizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly interpolizabilityStatusService: InterpolizabilityStatusService,
  ) {}

  getCapabilities() {
    return interpolizabilityCapabilitiesResponseSchema.parse({
      supportsInterpolizabilityRollout: true,
      supportsInterpolizabilityAdminTools: true,
      supportsBillingWebhookInterpolizabilitySignals: true,
      supportsBillingRecordInterpolizabilitySignals: true,
      guidance: getInterpolizabilityRolloutGuidance(),
    })
  }

  async getInterpolizabilityRollout() {
    const interpolizabilityTableCoverage =
      await this.interpolizabilityStatusService.getInterpolizabilityTableCoverage()

    const rollout = evaluateInterpolizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.interpolizabilityStatusService.pingPostgres(),
      existingInterpolizabilityTableCount: interpolizabilityTableCoverage.existingInterpolizabilityTableCount,
      billingWebhookEventsTableExists: interpolizabilityTableCoverage.billingWebhookEventsTableExists,
      billingRecordsTableExists: interpolizabilityTableCoverage.billingRecordsTableExists,
      usageEventsTableExists: interpolizabilityTableCoverage.usageEventsTableExists,
    })

    return interpolizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceInterpolizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageInterpolizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.interpolizabilityStatusService.getWorkspaceInterpolizabilityInventory(
        workspaceId,
      )
    const records = buildInterpolizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.interpolizabilityStatusService.pingPostgres()
    const stats = buildInterpolizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return interpolizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveInterpolizabilityAdminActions(),
      guidance: getInterpolizabilityAdminGuidance({ stats }),
    })
  }

  async executeInterpolizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_interpolizability_summary'
    },
  ) {
    this.assertCanManageInterpolizability(authContext)

    const payload = interpolizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_interpolizability_summary': {
        const summary = await this.getWorkspaceInterpolizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return interpolizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed interpolizability summary with ${summary.stats.interpolizabilityPercent}% billing webhook interpolizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageInterpolizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production interpolizability tools.',
    })
  }
}
