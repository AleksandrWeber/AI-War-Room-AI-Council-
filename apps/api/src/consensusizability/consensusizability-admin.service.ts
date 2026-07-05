import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getConsensusizabilityRolloutGuidance,
  consensusizabilityAdminActionRequestSchema,
  consensusizabilityAdminActionResponseSchema,
  consensusizabilityAdminSummaryResponseSchema,
  consensusizabilityCapabilitiesResponseSchema,
  consensusizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildConsensusizabilityAdminRecords,
  buildConsensusizabilityAdminStats,
  getConsensusizabilityAdminGuidance,
  resolveConsensusizabilityAdminActions,
} from './consensusizability-admin.helpers.js'
import { evaluateConsensusizabilityRollout } from './consensusizability-rollout.helpers.js'
import { ConsensusizabilityStatusService } from './consensusizability-status.service.js'

@Injectable()
export class ConsensusizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly consensusizabilityStatusService: ConsensusizabilityStatusService,
  ) {}

  getCapabilities() {
    return consensusizabilityCapabilitiesResponseSchema.parse({
      supportsConsensusizabilityRollout: true,
      supportsConsensusizabilityAdminTools: true,
      supportsModelHealthConsensusizabilitySignals: true,
      supportsModelRegistryConsensusizabilitySignals: true,
      guidance: getConsensusizabilityRolloutGuidance(),
    })
  }

  async getConsensusizabilityRollout() {
    const consensusizabilityTableCoverage =
      await this.consensusizabilityStatusService.getConsensusizabilityTableCoverage()

    const rollout = evaluateConsensusizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.consensusizabilityStatusService.pingPostgres(),
      existingConsensusizabilityTableCount: consensusizabilityTableCoverage.existingConsensusizabilityTableCount,
      modelHealthEventsTableExists: consensusizabilityTableCoverage.modelHealthEventsTableExists,
      modelRegistryEntriesTableExists: consensusizabilityTableCoverage.modelRegistryEntriesTableExists,
      billingRecordsTableExists: consensusizabilityTableCoverage.billingRecordsTableExists,
    })

    return consensusizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceConsensusizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageConsensusizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.consensusizabilityStatusService.getWorkspaceConsensusizabilityInventory(
        workspaceId,
      )
    const records = buildConsensusizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.consensusizabilityStatusService.pingPostgres()
    const stats = buildConsensusizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return consensusizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveConsensusizabilityAdminActions(),
      guidance: getConsensusizabilityAdminGuidance({ stats }),
    })
  }

  async executeConsensusizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_consensusizability_summary'
    },
  ) {
    this.assertCanManageConsensusizability(authContext)

    const payload = consensusizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_consensusizability_summary': {
        const summary = await this.getWorkspaceConsensusizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return consensusizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed consensusizability summary with ${summary.stats.consensusizabilityPercent}% model health consensusizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageConsensusizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production consensusizability tools.',
    })
  }
}
