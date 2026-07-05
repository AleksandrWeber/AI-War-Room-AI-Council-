import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getIndexingizabilityRolloutGuidance,
  indexingizabilityAdminActionRequestSchema,
  indexingizabilityAdminActionResponseSchema,
  indexingizabilityAdminSummaryResponseSchema,
  indexingizabilityCapabilitiesResponseSchema,
  indexingizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildIndexingizabilityAdminRecords,
  buildIndexingizabilityAdminStats,
  getIndexingizabilityAdminGuidance,
  resolveIndexingizabilityAdminActions,
} from './indexingizability-admin.helpers.js'
import { evaluateIndexingizabilityRollout } from './indexingizability-rollout.helpers.js'
import { IndexingizabilityStatusService } from './indexingizability-status.service.js'

@Injectable()
export class IndexingizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly indexingizabilityStatusService: IndexingizabilityStatusService,
  ) {}

  getCapabilities() {
    return indexingizabilityCapabilitiesResponseSchema.parse({
      supportsIndexingizabilityRollout: true,
      supportsIndexingizabilityAdminTools: true,
      supportsModelHealthIndexingizabilitySignals: true,
      supportsModelRegistryIndexingizabilitySignals: true,
      guidance: getIndexingizabilityRolloutGuidance(),
    })
  }

  async getIndexingizabilityRollout() {
    const indexingizabilityTableCoverage =
      await this.indexingizabilityStatusService.getIndexingizabilityTableCoverage()

    const rollout = evaluateIndexingizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.indexingizabilityStatusService.pingPostgres(),
      existingIndexingizabilityTableCount: indexingizabilityTableCoverage.existingIndexingizabilityTableCount,
      modelHealthEventsTableExists: indexingizabilityTableCoverage.modelHealthEventsTableExists,
      modelRegistryEntriesTableExists: indexingizabilityTableCoverage.modelRegistryEntriesTableExists,
      billingRecordsTableExists: indexingizabilityTableCoverage.billingRecordsTableExists,
    })

    return indexingizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceIndexingizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageIndexingizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.indexingizabilityStatusService.getWorkspaceIndexingizabilityInventory(
        workspaceId,
      )
    const records = buildIndexingizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.indexingizabilityStatusService.pingPostgres()
    const stats = buildIndexingizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return indexingizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveIndexingizabilityAdminActions(),
      guidance: getIndexingizabilityAdminGuidance({ stats }),
    })
  }

  async executeIndexingizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_indexingizability_summary'
    },
  ) {
    this.assertCanManageIndexingizability(authContext)

    const payload = indexingizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_indexingizability_summary': {
        const summary = await this.getWorkspaceIndexingizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return indexingizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed indexingizability summary with ${summary.stats.indexingizabilityPercent}% model health indexingizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageIndexingizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production indexingizability tools.',
    })
  }
}
