import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getRelayizabilityRolloutGuidance,
  relayizabilityAdminActionRequestSchema,
  relayizabilityAdminActionResponseSchema,
  relayizabilityAdminSummaryResponseSchema,
  relayizabilityCapabilitiesResponseSchema,
  relayizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildRelayizabilityAdminRecords,
  buildRelayizabilityAdminStats,
  getRelayizabilityAdminGuidance,
  resolveRelayizabilityAdminActions,
} from './relayizability-admin.helpers.js'
import { evaluateRelayizabilityRollout } from './relayizability-rollout.helpers.js'
import { RelayizabilityStatusService } from './relayizability-status.service.js'

@Injectable()
export class RelayizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly relayizabilityStatusService: RelayizabilityStatusService,
  ) {}

  getCapabilities() {
    return relayizabilityCapabilitiesResponseSchema.parse({
      supportsRelayizabilityRollout: true,
      supportsRelayizabilityAdminTools: true,
      supportsModelHealthRelayizabilitySignals: true,
      supportsModelRegistryRelayizabilitySignals: true,
      guidance: getRelayizabilityRolloutGuidance(),
    })
  }

  async getRelayizabilityRollout() {
    const relayizabilityTableCoverage =
      await this.relayizabilityStatusService.getRelayizabilityTableCoverage()

    const rollout = evaluateRelayizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.relayizabilityStatusService.pingPostgres(),
      existingRelayizabilityTableCount: relayizabilityTableCoverage.existingRelayizabilityTableCount,
      modelHealthEventsTableExists: relayizabilityTableCoverage.modelHealthEventsTableExists,
      modelRegistryEntriesTableExists: relayizabilityTableCoverage.modelRegistryEntriesTableExists,
      billingRecordsTableExists: relayizabilityTableCoverage.billingRecordsTableExists,
    })

    return relayizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceRelayizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageRelayizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.relayizabilityStatusService.getWorkspaceRelayizabilityInventory(
        workspaceId,
      )
    const records = buildRelayizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.relayizabilityStatusService.pingPostgres()
    const stats = buildRelayizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return relayizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveRelayizabilityAdminActions(),
      guidance: getRelayizabilityAdminGuidance({ stats }),
    })
  }

  async executeRelayizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_relayizability_summary'
    },
  ) {
    this.assertCanManageRelayizability(authContext)

    const payload = relayizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_relayizability_summary': {
        const summary = await this.getWorkspaceRelayizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return relayizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed relayizability summary with ${summary.stats.relayizabilityPercent}% model health relayizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageRelayizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production relayizability tools.',
    })
  }
}
