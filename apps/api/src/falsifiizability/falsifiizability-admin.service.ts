import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getFalsifiizabilityRolloutGuidance,
  falsifiizabilityAdminActionRequestSchema,
  falsifiizabilityAdminActionResponseSchema,
  falsifiizabilityAdminSummaryResponseSchema,
  falsifiizabilityCapabilitiesResponseSchema,
  falsifiizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildFalsifiizabilityAdminRecords,
  buildFalsifiizabilityAdminStats,
  getFalsifiizabilityAdminGuidance,
  resolveFalsifiizabilityAdminActions,
} from './falsifiizability-admin.helpers.js'
import { evaluateFalsifiizabilityRollout } from './falsifiizability-rollout.helpers.js'
import { FalsifiizabilityStatusService } from './falsifiizability-status.service.js'

@Injectable()
export class FalsifiizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly falsifiizabilityStatusService: FalsifiizabilityStatusService,
  ) {}

  getCapabilities() {
    return falsifiizabilityCapabilitiesResponseSchema.parse({
      supportsFalsifiizabilityRollout: true,
      supportsFalsifiizabilityAdminTools: true,
      supportsBillingNotificationFalsifiizabilitySignals: true,
      supportsBillingWebhookFalsifiizabilitySignals: true,
      guidance: getFalsifiizabilityRolloutGuidance(),
    })
  }

  async getFalsifiizabilityRollout() {
    const falsifiizabilityTableCoverage =
      await this.falsifiizabilityStatusService.getFalsifiizabilityTableCoverage()

    const rollout = evaluateFalsifiizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.falsifiizabilityStatusService.pingPostgres(),
      existingFalsifiizabilityTableCount: falsifiizabilityTableCoverage.existingFalsifiizabilityTableCount,
      billingNotificationsTableExists: falsifiizabilityTableCoverage.billingNotificationsTableExists,
      billingWebhookEventsTableExists: falsifiizabilityTableCoverage.billingWebhookEventsTableExists,
      usageEventsTableExists: falsifiizabilityTableCoverage.usageEventsTableExists,
    })

    return falsifiizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceFalsifiizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageFalsifiizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.falsifiizabilityStatusService.getWorkspaceFalsifiizabilityInventory(
        workspaceId,
      )
    const records = buildFalsifiizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.falsifiizabilityStatusService.pingPostgres()
    const stats = buildFalsifiizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return falsifiizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveFalsifiizabilityAdminActions(),
      guidance: getFalsifiizabilityAdminGuidance({ stats }),
    })
  }

  async executeFalsifiizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_falsifiizability_summary'
    },
  ) {
    this.assertCanManageFalsifiizability(authContext)

    const payload = falsifiizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_falsifiizability_summary': {
        const summary = await this.getWorkspaceFalsifiizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return falsifiizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed falsifiizability summary with ${summary.stats.falsifiizabilityPercent}% billing notification falsifiizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageFalsifiizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production falsifiizability tools.',
    })
  }
}
