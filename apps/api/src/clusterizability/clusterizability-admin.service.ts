import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getClusterizabilityRolloutGuidance,
  clusterizabilityAdminActionRequestSchema,
  clusterizabilityAdminActionResponseSchema,
  clusterizabilityAdminSummaryResponseSchema,
  clusterizabilityCapabilitiesResponseSchema,
  clusterizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildClusterizabilityAdminRecords,
  buildClusterizabilityAdminStats,
  getClusterizabilityAdminGuidance,
  resolveClusterizabilityAdminActions,
} from './clusterizability-admin.helpers.js'
import { evaluateClusterizabilityRollout } from './clusterizability-rollout.helpers.js'
import { ClusterizabilityStatusService } from './clusterizability-status.service.js'

@Injectable()
export class ClusterizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly clusterizabilityStatusService: ClusterizabilityStatusService,
  ) {}

  getCapabilities() {
    return clusterizabilityCapabilitiesResponseSchema.parse({
      supportsClusterizabilityRollout: true,
      supportsClusterizabilityAdminTools: true,
      supportsProviderCredentialClusterizabilitySignals: true,
      supportsModelRegistryClusterizabilitySignals: true,
      guidance: getClusterizabilityRolloutGuidance(),
    })
  }

  async getClusterizabilityRollout() {
    const clusterizabilityTableCoverage =
      await this.clusterizabilityStatusService.getClusterizabilityTableCoverage()

    const rollout = evaluateClusterizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.clusterizabilityStatusService.pingPostgres(),
      existingClusterizabilityTableCount: clusterizabilityTableCoverage.existingClusterizabilityTableCount,
      workspaceProviderCredentialsTableExists: clusterizabilityTableCoverage.workspaceProviderCredentialsTableExists,
      modelRegistryEntriesTableExists: clusterizabilityTableCoverage.modelRegistryEntriesTableExists,
      billingWebhookEventsTableExists: clusterizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return clusterizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceClusterizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageClusterizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.clusterizabilityStatusService.getWorkspaceClusterizabilityInventory(
        workspaceId,
      )
    const records = buildClusterizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.clusterizabilityStatusService.pingPostgres()
    const stats = buildClusterizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return clusterizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveClusterizabilityAdminActions(),
      guidance: getClusterizabilityAdminGuidance({ stats }),
    })
  }

  async executeClusterizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_clusterizability_summary'
    },
  ) {
    this.assertCanManageClusterizability(authContext)

    const payload = clusterizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_clusterizability_summary': {
        const summary = await this.getWorkspaceClusterizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return clusterizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed clusterizability summary with ${summary.stats.clusterizabilityPercent}% provider credential clusterizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageClusterizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production clusterizability tools.',
    })
  }
}
