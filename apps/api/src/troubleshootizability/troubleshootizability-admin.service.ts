import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getTroubleshootizabilityRolloutGuidance,
  troubleshootizabilityAdminActionRequestSchema,
  troubleshootizabilityAdminActionResponseSchema,
  troubleshootizabilityAdminSummaryResponseSchema,
  troubleshootizabilityCapabilitiesResponseSchema,
  troubleshootizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildTroubleshootizabilityAdminRecords,
  buildTroubleshootizabilityAdminStats,
  getTroubleshootizabilityAdminGuidance,
  resolveTroubleshootizabilityAdminActions,
} from './troubleshootizability-admin.helpers.js'
import { evaluateTroubleshootizabilityRollout } from './troubleshootizability-rollout.helpers.js'
import { TroubleshootizabilityStatusService } from './troubleshootizability-status.service.js'

@Injectable()
export class TroubleshootizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly troubleshootizabilityStatusService: TroubleshootizabilityStatusService,
  ) {}

  getCapabilities() {
    return troubleshootizabilityCapabilitiesResponseSchema.parse({
      supportsTroubleshootizabilityRollout: true,
      supportsTroubleshootizabilityAdminTools: true,
      supportsBillingNotificationTroubleshootizabilitySignals: true,
      supportsBillingWebhookTroubleshootizabilitySignals: true,
      guidance: getTroubleshootizabilityRolloutGuidance(),
    })
  }

  async getTroubleshootizabilityRollout() {
    const troubleshootizabilityTableCoverage =
      await this.troubleshootizabilityStatusService.getTroubleshootizabilityTableCoverage()

    const rollout = evaluateTroubleshootizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.troubleshootizabilityStatusService.pingPostgres(),
      existingTroubleshootizabilityTableCount: troubleshootizabilityTableCoverage.existingTroubleshootizabilityTableCount,
      billingNotificationsTableExists: troubleshootizabilityTableCoverage.billingNotificationsTableExists,
      billingWebhookEventsTableExists: troubleshootizabilityTableCoverage.billingWebhookEventsTableExists,
      usageEventsTableExists: troubleshootizabilityTableCoverage.usageEventsTableExists,
    })

    return troubleshootizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceTroubleshootizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageTroubleshootizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.troubleshootizabilityStatusService.getWorkspaceTroubleshootizabilityInventory(
        workspaceId,
      )
    const records = buildTroubleshootizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.troubleshootizabilityStatusService.pingPostgres()
    const stats = buildTroubleshootizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return troubleshootizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveTroubleshootizabilityAdminActions(),
      guidance: getTroubleshootizabilityAdminGuidance({ stats }),
    })
  }

  async executeTroubleshootizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_troubleshootizability_summary'
    },
  ) {
    this.assertCanManageTroubleshootizability(authContext)

    const payload = troubleshootizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_troubleshootizability_summary': {
        const summary = await this.getWorkspaceTroubleshootizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return troubleshootizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed troubleshootizability summary with ${summary.stats.troubleshootizabilityPercent}% billing notification troubleshootizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageTroubleshootizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production troubleshootizability tools.',
    })
  }
}
