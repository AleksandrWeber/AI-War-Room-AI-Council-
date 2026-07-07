import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getCredibilityvaultizabilityRolloutGuidance,
  credibilityvaultizabilityAdminActionRequestSchema,
  credibilityvaultizabilityAdminActionResponseSchema,
  credibilityvaultizabilityAdminSummaryResponseSchema,
  credibilityvaultizabilityCapabilitiesResponseSchema,
  credibilityvaultizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildCredibilityvaultizabilityAdminRecords,
  buildCredibilityvaultizabilityAdminStats,
  getCredibilityvaultizabilityAdminGuidance,
  resolveCredibilityvaultizabilityAdminActions,
} from './credibilityvaultizability-admin.helpers.js'
import { evaluateCredibilityvaultizabilityRollout } from './credibilityvaultizability-rollout.helpers.js'
import { CredibilityvaultizabilityStatusService } from './credibilityvaultizability-status.service.js'

@Injectable()
export class CredibilityvaultizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly credibilityvaultizabilityStatusService: CredibilityvaultizabilityStatusService,
  ) {}

  getCapabilities() {
    return credibilityvaultizabilityCapabilitiesResponseSchema.parse({
      supportsCredibilityvaultizabilityRollout: true,
      supportsCredibilityvaultizabilityAdminTools: true,
      supportsBillingNotificationCredibilityvaultizabilitySignals: true,
      supportsBillingWebhookCredibilityvaultizabilitySignals: true,
      guidance: getCredibilityvaultizabilityRolloutGuidance(),
    })
  }

  async getCredibilityvaultizabilityRollout() {
    const credibilityvaultizabilityTableCoverage =
      await this.credibilityvaultizabilityStatusService.getCredibilityvaultizabilityTableCoverage()

    const rollout = evaluateCredibilityvaultizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.credibilityvaultizabilityStatusService.pingPostgres(),
      existingCredibilityvaultizabilityTableCount: credibilityvaultizabilityTableCoverage.existingCredibilityvaultizabilityTableCount,
      billingNotificationsTableExists: credibilityvaultizabilityTableCoverage.billingNotificationsTableExists,
      billingWebhookEventsTableExists: credibilityvaultizabilityTableCoverage.billingWebhookEventsTableExists,
      usageEventsTableExists: credibilityvaultizabilityTableCoverage.usageEventsTableExists,
    })

    return credibilityvaultizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceCredibilityvaultizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageCredibilityvaultizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.credibilityvaultizabilityStatusService.getWorkspaceCredibilityvaultizabilityInventory(
        workspaceId,
      )
    const records = buildCredibilityvaultizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.credibilityvaultizabilityStatusService.pingPostgres()
    const stats = buildCredibilityvaultizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return credibilityvaultizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveCredibilityvaultizabilityAdminActions(),
      guidance: getCredibilityvaultizabilityAdminGuidance({ stats }),
    })
  }

  async executeCredibilityvaultizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_credibilityvaultizability_summary'
    },
  ) {
    this.assertCanManageCredibilityvaultizability(authContext)

    const payload = credibilityvaultizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_credibilityvaultizability_summary': {
        const summary = await this.getWorkspaceCredibilityvaultizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return credibilityvaultizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed credibilityvaultizability summary with ${summary.stats.credibilityvaultizabilityPercent}% billing notification credibilityvaultizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageCredibilityvaultizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production credibilityvaultizability tools.',
    })
  }
}
