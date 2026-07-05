import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getPrefetchizabilityRolloutGuidance,
  prefetchizabilityAdminActionRequestSchema,
  prefetchizabilityAdminActionResponseSchema,
  prefetchizabilityAdminSummaryResponseSchema,
  prefetchizabilityCapabilitiesResponseSchema,
  prefetchizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildPrefetchizabilityAdminRecords,
  buildPrefetchizabilityAdminStats,
  getPrefetchizabilityAdminGuidance,
  resolvePrefetchizabilityAdminActions,
} from './prefetchizability-admin.helpers.js'
import { evaluatePrefetchizabilityRollout } from './prefetchizability-rollout.helpers.js'
import { PrefetchizabilityStatusService } from './prefetchizability-status.service.js'

@Injectable()
export class PrefetchizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly prefetchizabilityStatusService: PrefetchizabilityStatusService,
  ) {}

  getCapabilities() {
    return prefetchizabilityCapabilitiesResponseSchema.parse({
      supportsPrefetchizabilityRollout: true,
      supportsPrefetchizabilityAdminTools: true,
      supportsProviderCredentialPrefetchizabilitySignals: true,
      supportsModelRegistryPrefetchizabilitySignals: true,
      guidance: getPrefetchizabilityRolloutGuidance(),
    })
  }

  async getPrefetchizabilityRollout() {
    const prefetchizabilityTableCoverage =
      await this.prefetchizabilityStatusService.getPrefetchizabilityTableCoverage()

    const rollout = evaluatePrefetchizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.prefetchizabilityStatusService.pingPostgres(),
      existingPrefetchizabilityTableCount: prefetchizabilityTableCoverage.existingPrefetchizabilityTableCount,
      workspaceProviderCredentialsTableExists: prefetchizabilityTableCoverage.workspaceProviderCredentialsTableExists,
      modelRegistryEntriesTableExists: prefetchizabilityTableCoverage.modelRegistryEntriesTableExists,
      billingWebhookEventsTableExists: prefetchizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return prefetchizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspacePrefetchizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManagePrefetchizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.prefetchizabilityStatusService.getWorkspacePrefetchizabilityInventory(
        workspaceId,
      )
    const records = buildPrefetchizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.prefetchizabilityStatusService.pingPostgres()
    const stats = buildPrefetchizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return prefetchizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolvePrefetchizabilityAdminActions(),
      guidance: getPrefetchizabilityAdminGuidance({ stats }),
    })
  }

  async executePrefetchizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_prefetchizability_summary'
    },
  ) {
    this.assertCanManagePrefetchizability(authContext)

    const payload = prefetchizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_prefetchizability_summary': {
        const summary = await this.getWorkspacePrefetchizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return prefetchizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed prefetchizability summary with ${summary.stats.prefetchizabilityPercent}% provider credential prefetchizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManagePrefetchizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production prefetchizability tools.',
    })
  }
}
