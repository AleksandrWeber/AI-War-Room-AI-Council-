import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getWitnessproofizabilityRolloutGuidance,
  witnessproofizabilityAdminActionRequestSchema,
  witnessproofizabilityAdminActionResponseSchema,
  witnessproofizabilityAdminSummaryResponseSchema,
  witnessproofizabilityCapabilitiesResponseSchema,
  witnessproofizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildWitnessproofizabilityAdminRecords,
  buildWitnessproofizabilityAdminStats,
  getWitnessproofizabilityAdminGuidance,
  resolveWitnessproofizabilityAdminActions,
} from './witnessproofizability-admin.helpers.js'
import { evaluateWitnessproofizabilityRollout } from './witnessproofizability-rollout.helpers.js'
import { WitnessproofizabilityStatusService } from './witnessproofizability-status.service.js'

@Injectable()
export class WitnessproofizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly witnessproofizabilityStatusService: WitnessproofizabilityStatusService,
  ) {}

  getCapabilities() {
    return witnessproofizabilityCapabilitiesResponseSchema.parse({
      supportsWitnessproofizabilityRollout: true,
      supportsWitnessproofizabilityAdminTools: true,
      supportsBillingNotificationWitnessproofizabilitySignals: true,
      supportsBillingWebhookWitnessproofizabilitySignals: true,
      guidance: getWitnessproofizabilityRolloutGuidance(),
    })
  }

  async getWitnessproofizabilityRollout() {
    const witnessproofizabilityTableCoverage =
      await this.witnessproofizabilityStatusService.getWitnessproofizabilityTableCoverage()

    const rollout = evaluateWitnessproofizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.witnessproofizabilityStatusService.pingPostgres(),
      existingWitnessproofizabilityTableCount: witnessproofizabilityTableCoverage.existingWitnessproofizabilityTableCount,
      billingNotificationsTableExists: witnessproofizabilityTableCoverage.billingNotificationsTableExists,
      billingWebhookEventsTableExists: witnessproofizabilityTableCoverage.billingWebhookEventsTableExists,
      usageEventsTableExists: witnessproofizabilityTableCoverage.usageEventsTableExists,
    })

    return witnessproofizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceWitnessproofizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageWitnessproofizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.witnessproofizabilityStatusService.getWorkspaceWitnessproofizabilityInventory(
        workspaceId,
      )
    const records = buildWitnessproofizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.witnessproofizabilityStatusService.pingPostgres()
    const stats = buildWitnessproofizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return witnessproofizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveWitnessproofizabilityAdminActions(),
      guidance: getWitnessproofizabilityAdminGuidance({ stats }),
    })
  }

  async executeWitnessproofizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_witnessproofizability_summary'
    },
  ) {
    this.assertCanManageWitnessproofizability(authContext)

    const payload = witnessproofizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_witnessproofizability_summary': {
        const summary = await this.getWorkspaceWitnessproofizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return witnessproofizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed witnessproofizability summary with ${summary.stats.witnessproofizabilityPercent}% billing notification witnessproofizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageWitnessproofizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production witnessproofizability tools.',
    })
  }
}
