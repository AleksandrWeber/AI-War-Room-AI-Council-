import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getSequencizabilityRolloutGuidance,
  sequencizabilityAdminActionRequestSchema,
  sequencizabilityAdminActionResponseSchema,
  sequencizabilityAdminSummaryResponseSchema,
  sequencizabilityCapabilitiesResponseSchema,
  sequencizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildSequencizabilityAdminRecords,
  buildSequencizabilityAdminStats,
  getSequencizabilityAdminGuidance,
  resolveSequencizabilityAdminActions,
} from './sequencizability-admin.helpers.js'
import { evaluateSequencizabilityRollout } from './sequencizability-rollout.helpers.js'
import { SequencizabilityStatusService } from './sequencizability-status.service.js'

@Injectable()
export class SequencizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly sequencizabilityStatusService: SequencizabilityStatusService,
  ) {}

  getCapabilities() {
    return sequencizabilityCapabilitiesResponseSchema.parse({
      supportsSequencizabilityRollout: true,
      supportsSequencizabilityAdminTools: true,
      supportsModelHealthSequencizabilitySignals: true,
      supportsModelRegistrySequencizabilitySignals: true,
      guidance: getSequencizabilityRolloutGuidance(),
    })
  }

  async getSequencizabilityRollout() {
    const sequencizabilityTableCoverage =
      await this.sequencizabilityStatusService.getSequencizabilityTableCoverage()

    const rollout = evaluateSequencizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.sequencizabilityStatusService.pingPostgres(),
      existingSequencizabilityTableCount: sequencizabilityTableCoverage.existingSequencizabilityTableCount,
      modelHealthEventsTableExists: sequencizabilityTableCoverage.modelHealthEventsTableExists,
      modelRegistryEntriesTableExists: sequencizabilityTableCoverage.modelRegistryEntriesTableExists,
      billingRecordsTableExists: sequencizabilityTableCoverage.billingRecordsTableExists,
    })

    return sequencizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceSequencizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageSequencizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.sequencizabilityStatusService.getWorkspaceSequencizabilityInventory(
        workspaceId,
      )
    const records = buildSequencizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.sequencizabilityStatusService.pingPostgres()
    const stats = buildSequencizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return sequencizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveSequencizabilityAdminActions(),
      guidance: getSequencizabilityAdminGuidance({ stats }),
    })
  }

  async executeSequencizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_sequencizability_summary'
    },
  ) {
    this.assertCanManageSequencizability(authContext)

    const payload = sequencizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_sequencizability_summary': {
        const summary = await this.getWorkspaceSequencizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return sequencizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed sequencizability summary with ${summary.stats.sequencizabilityPercent}% model health sequencizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageSequencizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production sequencizability tools.',
    })
  }
}
