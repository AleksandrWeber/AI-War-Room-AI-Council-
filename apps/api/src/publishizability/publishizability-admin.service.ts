import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getPublishizabilityRolloutGuidance,
  publishizabilityAdminActionRequestSchema,
  publishizabilityAdminActionResponseSchema,
  publishizabilityAdminSummaryResponseSchema,
  publishizabilityCapabilitiesResponseSchema,
  publishizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildPublishizabilityAdminRecords,
  buildPublishizabilityAdminStats,
  getPublishizabilityAdminGuidance,
  resolvePublishizabilityAdminActions,
} from './publishizability-admin.helpers.js'
import { evaluatePublishizabilityRollout } from './publishizability-rollout.helpers.js'
import { PublishizabilityStatusService } from './publishizability-status.service.js'

@Injectable()
export class PublishizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly publishizabilityStatusService: PublishizabilityStatusService,
  ) {}

  getCapabilities() {
    return publishizabilityCapabilitiesResponseSchema.parse({
      supportsPublishizabilityRollout: true,
      supportsPublishizabilityAdminTools: true,
      supportsMeterUsagePublishizabilitySignals: true,
      supportsUsageEventPublishizabilitySignals: true,
      guidance: getPublishizabilityRolloutGuidance(),
    })
  }

  async getPublishizabilityRollout() {
    const publishizabilityTableCoverage =
      await this.publishizabilityStatusService.getPublishizabilityTableCoverage()

    const rollout = evaluatePublishizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.publishizabilityStatusService.pingPostgres(),
      existingPublishizabilityTableCount: publishizabilityTableCoverage.existingPublishizabilityTableCount,
      billingMeterUsageReportsTableExists: publishizabilityTableCoverage.billingMeterUsageReportsTableExists,
      usageEventsTableExists: publishizabilityTableCoverage.usageEventsTableExists,
      workspaceUsageLimitsTableExists: publishizabilityTableCoverage.workspaceUsageLimitsTableExists,
    })

    return publishizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspacePublishizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManagePublishizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.publishizabilityStatusService.getWorkspacePublishizabilityInventory(
        workspaceId,
      )
    const records = buildPublishizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.publishizabilityStatusService.pingPostgres()
    const stats = buildPublishizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return publishizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolvePublishizabilityAdminActions(),
      guidance: getPublishizabilityAdminGuidance({ stats }),
    })
  }

  async executePublishizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_publishizability_summary'
    },
  ) {
    this.assertCanManagePublishizability(authContext)

    const payload = publishizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_publishizability_summary': {
        const summary = await this.getWorkspacePublishizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return publishizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed publishizability summary with ${summary.stats.publishizabilityPercent}% meter usage publishizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManagePublishizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production publishizability tools.',
    })
  }
}
