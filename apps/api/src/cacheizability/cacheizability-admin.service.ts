import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getCacheizabilityRolloutGuidance,
  cacheizabilityAdminActionRequestSchema,
  cacheizabilityAdminActionResponseSchema,
  cacheizabilityAdminSummaryResponseSchema,
  cacheizabilityCapabilitiesResponseSchema,
  cacheizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildCacheizabilityAdminRecords,
  buildCacheizabilityAdminStats,
  getCacheizabilityAdminGuidance,
  resolveCacheizabilityAdminActions,
} from './cacheizability-admin.helpers.js'
import { evaluateCacheizabilityRollout } from './cacheizability-rollout.helpers.js'
import { CacheizabilityStatusService } from './cacheizability-status.service.js'

@Injectable()
export class CacheizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly cacheizabilityStatusService: CacheizabilityStatusService,
  ) {}

  getCapabilities() {
    return cacheizabilityCapabilitiesResponseSchema.parse({
      supportsCacheizabilityRollout: true,
      supportsCacheizabilityAdminTools: true,
      supportsModelHealthCacheizabilitySignals: true,
      supportsModelRegistryCacheizabilitySignals: true,
      guidance: getCacheizabilityRolloutGuidance(),
    })
  }

  async getCacheizabilityRollout() {
    const cacheizabilityTableCoverage =
      await this.cacheizabilityStatusService.getCacheizabilityTableCoverage()

    const rollout = evaluateCacheizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.cacheizabilityStatusService.pingPostgres(),
      existingCacheizabilityTableCount: cacheizabilityTableCoverage.existingCacheizabilityTableCount,
      modelHealthEventsTableExists: cacheizabilityTableCoverage.modelHealthEventsTableExists,
      modelRegistryEntriesTableExists: cacheizabilityTableCoverage.modelRegistryEntriesTableExists,
      billingRecordsTableExists: cacheizabilityTableCoverage.billingRecordsTableExists,
    })

    return cacheizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceCacheizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageCacheizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.cacheizabilityStatusService.getWorkspaceCacheizabilityInventory(
        workspaceId,
      )
    const records = buildCacheizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.cacheizabilityStatusService.pingPostgres()
    const stats = buildCacheizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return cacheizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveCacheizabilityAdminActions(),
      guidance: getCacheizabilityAdminGuidance({ stats }),
    })
  }

  async executeCacheizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_cacheizability_summary'
    },
  ) {
    this.assertCanManageCacheizability(authContext)

    const payload = cacheizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_cacheizability_summary': {
        const summary = await this.getWorkspaceCacheizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return cacheizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed cacheizability summary with ${summary.stats.cacheizabilityPercent}% model health cacheizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageCacheizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production cacheizability tools.',
    })
  }
}
