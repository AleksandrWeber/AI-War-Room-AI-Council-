import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getHandoffizabilityRolloutGuidance,
  handoffizabilityAdminActionRequestSchema,
  handoffizabilityAdminActionResponseSchema,
  handoffizabilityAdminSummaryResponseSchema,
  handoffizabilityCapabilitiesResponseSchema,
  handoffizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildHandoffizabilityAdminRecords,
  buildHandoffizabilityAdminStats,
  getHandoffizabilityAdminGuidance,
  resolveHandoffizabilityAdminActions,
} from './handoffizability-admin.helpers.js'
import { evaluateHandoffizabilityRollout } from './handoffizability-rollout.helpers.js'
import { HandoffizabilityStatusService } from './handoffizability-status.service.js'

@Injectable()
export class HandoffizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly handoffizabilityStatusService: HandoffizabilityStatusService,
  ) {}

  getCapabilities() {
    return handoffizabilityCapabilitiesResponseSchema.parse({
      supportsHandoffizabilityRollout: true,
      supportsHandoffizabilityAdminTools: true,
      supportsShieldScanHandoffizabilitySignals: true,
      supportsProviderCredentialHandoffizabilitySignals: true,
      guidance: getHandoffizabilityRolloutGuidance(),
    })
  }

  async getHandoffizabilityRollout() {
    const handoffizabilityTableCoverage =
      await this.handoffizabilityStatusService.getHandoffizabilityTableCoverage()

    const rollout = evaluateHandoffizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.handoffizabilityStatusService.pingPostgres(),
      existingHandoffizabilityTableCount: handoffizabilityTableCoverage.existingHandoffizabilityTableCount,
      shieldScansTableExists: handoffizabilityTableCoverage.shieldScansTableExists,
      workspaceProviderCredentialsTableExists: handoffizabilityTableCoverage.workspaceProviderCredentialsTableExists,
      billingWebhookEventsTableExists: handoffizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return handoffizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceHandoffizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageHandoffizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.handoffizabilityStatusService.getWorkspaceHandoffizabilityInventory(
        workspaceId,
      )
    const records = buildHandoffizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.handoffizabilityStatusService.pingPostgres()
    const stats = buildHandoffizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return handoffizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveHandoffizabilityAdminActions(),
      guidance: getHandoffizabilityAdminGuidance({ stats }),
    })
  }

  async executeHandoffizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_handoffizability_summary'
    },
  ) {
    this.assertCanManageHandoffizability(authContext)

    const payload = handoffizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_handoffizability_summary': {
        const summary = await this.getWorkspaceHandoffizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return handoffizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed handoffizability summary with ${summary.stats.handoffizabilityPercent}% shield scan handoffizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageHandoffizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production handoffizability tools.',
    })
  }
}
