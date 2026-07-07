import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getIdentityizabilityRolloutGuidance,
  identityizabilityAdminActionRequestSchema,
  identityizabilityAdminActionResponseSchema,
  identityizabilityAdminSummaryResponseSchema,
  identityizabilityCapabilitiesResponseSchema,
  identityizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildIdentityizabilityAdminRecords,
  buildIdentityizabilityAdminStats,
  getIdentityizabilityAdminGuidance,
  resolveIdentityizabilityAdminActions,
} from './identityizability-admin.helpers.js'
import { evaluateIdentityizabilityRollout } from './identityizability-rollout.helpers.js'
import { IdentityizabilityStatusService } from './identityizability-status.service.js'

@Injectable()
export class IdentityizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly identityizabilityStatusService: IdentityizabilityStatusService,
  ) {}

  getCapabilities() {
    return identityizabilityCapabilitiesResponseSchema.parse({
      supportsIdentityizabilityRollout: true,
      supportsIdentityizabilityAdminTools: true,
      supportsBillingNotificationIdentityizabilitySignals: true,
      supportsBillingWebhookIdentityizabilitySignals: true,
      guidance: getIdentityizabilityRolloutGuidance(),
    })
  }

  async getIdentityizabilityRollout() {
    const identityizabilityTableCoverage =
      await this.identityizabilityStatusService.getIdentityizabilityTableCoverage()

    const rollout = evaluateIdentityizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.identityizabilityStatusService.pingPostgres(),
      existingIdentityizabilityTableCount: identityizabilityTableCoverage.existingIdentityizabilityTableCount,
      billingNotificationsTableExists: identityizabilityTableCoverage.billingNotificationsTableExists,
      billingWebhookEventsTableExists: identityizabilityTableCoverage.billingWebhookEventsTableExists,
      usageEventsTableExists: identityizabilityTableCoverage.usageEventsTableExists,
    })

    return identityizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceIdentityizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageIdentityizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.identityizabilityStatusService.getWorkspaceIdentityizabilityInventory(
        workspaceId,
      )
    const records = buildIdentityizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.identityizabilityStatusService.pingPostgres()
    const stats = buildIdentityizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return identityizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveIdentityizabilityAdminActions(),
      guidance: getIdentityizabilityAdminGuidance({ stats }),
    })
  }

  async executeIdentityizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_identityizability_summary'
    },
  ) {
    this.assertCanManageIdentityizability(authContext)

    const payload = identityizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_identityizability_summary': {
        const summary = await this.getWorkspaceIdentityizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return identityizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed identityizability summary with ${summary.stats.identityizabilityPercent}% billing notification identityizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageIdentityizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production identityizability tools.',
    })
  }
}
