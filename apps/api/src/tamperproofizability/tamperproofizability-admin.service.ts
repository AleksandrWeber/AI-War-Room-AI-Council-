import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getTamperproofizabilityRolloutGuidance,
  tamperproofizabilityAdminActionRequestSchema,
  tamperproofizabilityAdminActionResponseSchema,
  tamperproofizabilityAdminSummaryResponseSchema,
  tamperproofizabilityCapabilitiesResponseSchema,
  tamperproofizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildTamperproofizabilityAdminRecords,
  buildTamperproofizabilityAdminStats,
  getTamperproofizabilityAdminGuidance,
  resolveTamperproofizabilityAdminActions,
} from './tamperproofizability-admin.helpers.js'
import { evaluateTamperproofizabilityRollout } from './tamperproofizability-rollout.helpers.js'
import { TamperproofizabilityStatusService } from './tamperproofizability-status.service.js'

@Injectable()
export class TamperproofizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly tamperproofizabilityStatusService: TamperproofizabilityStatusService,
  ) {}

  getCapabilities() {
    return tamperproofizabilityCapabilitiesResponseSchema.parse({
      supportsTamperproofizabilityRollout: true,
      supportsTamperproofizabilityAdminTools: true,
      supportsBillingNotificationTamperproofizabilitySignals: true,
      supportsBillingWebhookTamperproofizabilitySignals: true,
      guidance: getTamperproofizabilityRolloutGuidance(),
    })
  }

  async getTamperproofizabilityRollout() {
    const tamperproofizabilityTableCoverage =
      await this.tamperproofizabilityStatusService.getTamperproofizabilityTableCoverage()

    const rollout = evaluateTamperproofizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.tamperproofizabilityStatusService.pingPostgres(),
      existingTamperproofizabilityTableCount: tamperproofizabilityTableCoverage.existingTamperproofizabilityTableCount,
      billingNotificationsTableExists: tamperproofizabilityTableCoverage.billingNotificationsTableExists,
      billingWebhookEventsTableExists: tamperproofizabilityTableCoverage.billingWebhookEventsTableExists,
      usageEventsTableExists: tamperproofizabilityTableCoverage.usageEventsTableExists,
    })

    return tamperproofizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceTamperproofizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageTamperproofizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.tamperproofizabilityStatusService.getWorkspaceTamperproofizabilityInventory(
        workspaceId,
      )
    const records = buildTamperproofizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.tamperproofizabilityStatusService.pingPostgres()
    const stats = buildTamperproofizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return tamperproofizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveTamperproofizabilityAdminActions(),
      guidance: getTamperproofizabilityAdminGuidance({ stats }),
    })
  }

  async executeTamperproofizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_tamperproofizability_summary'
    },
  ) {
    this.assertCanManageTamperproofizability(authContext)

    const payload = tamperproofizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_tamperproofizability_summary': {
        const summary = await this.getWorkspaceTamperproofizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return tamperproofizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed tamperproofizability summary with ${summary.stats.tamperproofizabilityPercent}% billing notification tamperproofizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageTamperproofizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production tamperproofizability tools.',
    })
  }
}
