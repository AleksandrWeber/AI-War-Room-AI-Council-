import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getCitationizabilityRolloutGuidance,
  citationizabilityAdminActionRequestSchema,
  citationizabilityAdminActionResponseSchema,
  citationizabilityAdminSummaryResponseSchema,
  citationizabilityCapabilitiesResponseSchema,
  citationizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildCitationizabilityAdminRecords,
  buildCitationizabilityAdminStats,
  getCitationizabilityAdminGuidance,
  resolveCitationizabilityAdminActions,
} from './citationizability-admin.helpers.js'
import { evaluateCitationizabilityRollout } from './citationizability-rollout.helpers.js'
import { CitationizabilityStatusService } from './citationizability-status.service.js'

@Injectable()
export class CitationizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly citationizabilityStatusService: CitationizabilityStatusService,
  ) {}

  getCapabilities() {
    return citationizabilityCapabilitiesResponseSchema.parse({
      supportsCitationizabilityRollout: true,
      supportsCitationizabilityAdminTools: true,
      supportsBillingNotificationCitationizabilitySignals: true,
      supportsBillingWebhookCitationizabilitySignals: true,
      guidance: getCitationizabilityRolloutGuidance(),
    })
  }

  async getCitationizabilityRollout() {
    const citationizabilityTableCoverage =
      await this.citationizabilityStatusService.getCitationizabilityTableCoverage()

    const rollout = evaluateCitationizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.citationizabilityStatusService.pingPostgres(),
      existingCitationizabilityTableCount: citationizabilityTableCoverage.existingCitationizabilityTableCount,
      billingNotificationsTableExists: citationizabilityTableCoverage.billingNotificationsTableExists,
      billingWebhookEventsTableExists: citationizabilityTableCoverage.billingWebhookEventsTableExists,
      usageEventsTableExists: citationizabilityTableCoverage.usageEventsTableExists,
    })

    return citationizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceCitationizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageCitationizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.citationizabilityStatusService.getWorkspaceCitationizabilityInventory(
        workspaceId,
      )
    const records = buildCitationizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.citationizabilityStatusService.pingPostgres()
    const stats = buildCitationizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return citationizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveCitationizabilityAdminActions(),
      guidance: getCitationizabilityAdminGuidance({ stats }),
    })
  }

  async executeCitationizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_citationizability_summary'
    },
  ) {
    this.assertCanManageCitationizability(authContext)

    const payload = citationizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_citationizability_summary': {
        const summary = await this.getWorkspaceCitationizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return citationizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed citationizability summary with ${summary.stats.citationizabilityPercent}% billing notification citationizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageCitationizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production citationizability tools.',
    })
  }
}
