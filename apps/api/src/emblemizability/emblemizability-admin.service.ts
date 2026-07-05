import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getEmblemizabilityRolloutGuidance,
  emblemizabilityAdminActionRequestSchema,
  emblemizabilityAdminActionResponseSchema,
  emblemizabilityAdminSummaryResponseSchema,
  emblemizabilityCapabilitiesResponseSchema,
  emblemizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildEmblemizabilityAdminRecords,
  buildEmblemizabilityAdminStats,
  getEmblemizabilityAdminGuidance,
  resolveEmblemizabilityAdminActions,
} from './emblemizability-admin.helpers.js'
import { evaluateEmblemizabilityRollout } from './emblemizability-rollout.helpers.js'
import { EmblemizabilityStatusService } from './emblemizability-status.service.js'

@Injectable()
export class EmblemizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly emblemizabilityStatusService: EmblemizabilityStatusService,
  ) {}

  getCapabilities() {
    return emblemizabilityCapabilitiesResponseSchema.parse({
      supportsEmblemizabilityRollout: true,
      supportsEmblemizabilityAdminTools: true,
      supportsBillingNotificationEmblemizabilitySignals: true,
      supportsBillingWebhookEmblemizabilitySignals: true,
      guidance: getEmblemizabilityRolloutGuidance(),
    })
  }

  async getEmblemizabilityRollout() {
    const emblemizabilityTableCoverage =
      await this.emblemizabilityStatusService.getEmblemizabilityTableCoverage()

    const rollout = evaluateEmblemizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.emblemizabilityStatusService.pingPostgres(),
      existingEmblemizabilityTableCount: emblemizabilityTableCoverage.existingEmblemizabilityTableCount,
      billingNotificationsTableExists: emblemizabilityTableCoverage.billingNotificationsTableExists,
      billingWebhookEventsTableExists: emblemizabilityTableCoverage.billingWebhookEventsTableExists,
      usageEventsTableExists: emblemizabilityTableCoverage.usageEventsTableExists,
    })

    return emblemizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceEmblemizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageEmblemizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.emblemizabilityStatusService.getWorkspaceEmblemizabilityInventory(
        workspaceId,
      )
    const records = buildEmblemizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.emblemizabilityStatusService.pingPostgres()
    const stats = buildEmblemizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return emblemizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveEmblemizabilityAdminActions(),
      guidance: getEmblemizabilityAdminGuidance({ stats }),
    })
  }

  async executeEmblemizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_emblemizability_summary'
    },
  ) {
    this.assertCanManageEmblemizability(authContext)

    const payload = emblemizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_emblemizability_summary': {
        const summary = await this.getWorkspaceEmblemizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return emblemizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed emblemizability summary with ${summary.stats.emblemizabilityPercent}% billing notification emblemizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageEmblemizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production emblemizability tools.',
    })
  }
}
