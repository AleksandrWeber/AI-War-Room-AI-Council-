import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getChainingizabilityRolloutGuidance,
  chainingizabilityAdminActionRequestSchema,
  chainingizabilityAdminActionResponseSchema,
  chainingizabilityAdminSummaryResponseSchema,
  chainingizabilityCapabilitiesResponseSchema,
  chainingizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildChainingizabilityAdminRecords,
  buildChainingizabilityAdminStats,
  getChainingizabilityAdminGuidance,
  resolveChainingizabilityAdminActions,
} from './chainingizability-admin.helpers.js'
import { evaluateChainingizabilityRollout } from './chainingizability-rollout.helpers.js'
import { ChainingizabilityStatusService } from './chainingizability-status.service.js'

@Injectable()
export class ChainingizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly chainingizabilityStatusService: ChainingizabilityStatusService,
  ) {}

  getCapabilities() {
    return chainingizabilityCapabilitiesResponseSchema.parse({
      supportsChainingizabilityRollout: true,
      supportsChainingizabilityAdminTools: true,
      supportsShieldScanChainingizabilitySignals: true,
      supportsProviderCredentialChainingizabilitySignals: true,
      guidance: getChainingizabilityRolloutGuidance(),
    })
  }

  async getChainingizabilityRollout() {
    const chainingizabilityTableCoverage =
      await this.chainingizabilityStatusService.getChainingizabilityTableCoverage()

    const rollout = evaluateChainingizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.chainingizabilityStatusService.pingPostgres(),
      existingChainingizabilityTableCount: chainingizabilityTableCoverage.existingChainingizabilityTableCount,
      shieldScansTableExists: chainingizabilityTableCoverage.shieldScansTableExists,
      workspaceProviderCredentialsTableExists: chainingizabilityTableCoverage.workspaceProviderCredentialsTableExists,
      billingWebhookEventsTableExists: chainingizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return chainingizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceChainingizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageChainingizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.chainingizabilityStatusService.getWorkspaceChainingizabilityInventory(
        workspaceId,
      )
    const records = buildChainingizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.chainingizabilityStatusService.pingPostgres()
    const stats = buildChainingizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return chainingizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveChainingizabilityAdminActions(),
      guidance: getChainingizabilityAdminGuidance({ stats }),
    })
  }

  async executeChainingizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_chainingizability_summary'
    },
  ) {
    this.assertCanManageChainingizability(authContext)

    const payload = chainingizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_chainingizability_summary': {
        const summary = await this.getWorkspaceChainingizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return chainingizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed chainingizability summary with ${summary.stats.chainingizabilityPercent}% shield scan chainingizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageChainingizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production chainingizability tools.',
    })
  }
}
