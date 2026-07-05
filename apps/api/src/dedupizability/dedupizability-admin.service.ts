import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getDedupizabilityRolloutGuidance,
  dedupizabilityAdminActionRequestSchema,
  dedupizabilityAdminActionResponseSchema,
  dedupizabilityAdminSummaryResponseSchema,
  dedupizabilityCapabilitiesResponseSchema,
  dedupizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildDedupizabilityAdminRecords,
  buildDedupizabilityAdminStats,
  getDedupizabilityAdminGuidance,
  resolveDedupizabilityAdminActions,
} from './dedupizability-admin.helpers.js'
import { evaluateDedupizabilityRollout } from './dedupizability-rollout.helpers.js'
import { DedupizabilityStatusService } from './dedupizability-status.service.js'

@Injectable()
export class DedupizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly dedupizabilityStatusService: DedupizabilityStatusService,
  ) {}

  getCapabilities() {
    return dedupizabilityCapabilitiesResponseSchema.parse({
      supportsDedupizabilityRollout: true,
      supportsDedupizabilityAdminTools: true,
      supportsProviderCredentialDedupizabilitySignals: true,
      supportsModelRegistryDedupizabilitySignals: true,
      guidance: getDedupizabilityRolloutGuidance(),
    })
  }

  async getDedupizabilityRollout() {
    const dedupizabilityTableCoverage =
      await this.dedupizabilityStatusService.getDedupizabilityTableCoverage()

    const rollout = evaluateDedupizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.dedupizabilityStatusService.pingPostgres(),
      existingDedupizabilityTableCount: dedupizabilityTableCoverage.existingDedupizabilityTableCount,
      workspaceProviderCredentialsTableExists: dedupizabilityTableCoverage.workspaceProviderCredentialsTableExists,
      modelRegistryEntriesTableExists: dedupizabilityTableCoverage.modelRegistryEntriesTableExists,
      billingWebhookEventsTableExists: dedupizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return dedupizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceDedupizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageDedupizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.dedupizabilityStatusService.getWorkspaceDedupizabilityInventory(
        workspaceId,
      )
    const records = buildDedupizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.dedupizabilityStatusService.pingPostgres()
    const stats = buildDedupizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return dedupizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveDedupizabilityAdminActions(),
      guidance: getDedupizabilityAdminGuidance({ stats }),
    })
  }

  async executeDedupizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_dedupizability_summary'
    },
  ) {
    this.assertCanManageDedupizability(authContext)

    const payload = dedupizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_dedupizability_summary': {
        const summary = await this.getWorkspaceDedupizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return dedupizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed dedupizability summary with ${summary.stats.dedupizabilityPercent}% provider credential dedupizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageDedupizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production dedupizability tools.',
    })
  }
}
