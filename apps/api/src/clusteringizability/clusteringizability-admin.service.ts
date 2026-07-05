import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getClusteringizabilityRolloutGuidance,
  clusteringizabilityAdminActionRequestSchema,
  clusteringizabilityAdminActionResponseSchema,
  clusteringizabilityAdminSummaryResponseSchema,
  clusteringizabilityCapabilitiesResponseSchema,
  clusteringizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildClusteringizabilityAdminRecords,
  buildClusteringizabilityAdminStats,
  getClusteringizabilityAdminGuidance,
  resolveClusteringizabilityAdminActions,
} from './clusteringizability-admin.helpers.js'
import { evaluateClusteringizabilityRollout } from './clusteringizability-rollout.helpers.js'
import { ClusteringizabilityStatusService } from './clusteringizability-status.service.js'

@Injectable()
export class ClusteringizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly clusteringizabilityStatusService: ClusteringizabilityStatusService,
  ) {}

  getCapabilities() {
    return clusteringizabilityCapabilitiesResponseSchema.parse({
      supportsClusteringizabilityRollout: true,
      supportsClusteringizabilityAdminTools: true,
      supportsBillingInvoiceClusteringizabilitySignals: true,
      supportsBillingRecordClusteringizabilitySignals: true,
      guidance: getClusteringizabilityRolloutGuidance(),
    })
  }

  async getClusteringizabilityRollout() {
    const clusteringizabilityTableCoverage =
      await this.clusteringizabilityStatusService.getClusteringizabilityTableCoverage()

    const rollout = evaluateClusteringizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.clusteringizabilityStatusService.pingPostgres(),
      existingClusteringizabilityTableCount: clusteringizabilityTableCoverage.existingClusteringizabilityTableCount,
      billingInvoicesTableExists: clusteringizabilityTableCoverage.billingInvoicesTableExists,
      billingRecordsTableExists: clusteringizabilityTableCoverage.billingRecordsTableExists,
      billingWebhookEventsTableExists: clusteringizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return clusteringizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceClusteringizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageClusteringizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.clusteringizabilityStatusService.getWorkspaceClusteringizabilityInventory(
        workspaceId,
      )
    const records = buildClusteringizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.clusteringizabilityStatusService.pingPostgres()
    const stats = buildClusteringizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return clusteringizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveClusteringizabilityAdminActions(),
      guidance: getClusteringizabilityAdminGuidance({ stats }),
    })
  }

  async executeClusteringizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_clusteringizability_summary'
    },
  ) {
    this.assertCanManageClusteringizability(authContext)

    const payload = clusteringizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_clusteringizability_summary': {
        const summary = await this.getWorkspaceClusteringizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return clusteringizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed clusteringizability summary with ${summary.stats.clusteringizabilityPercent}% billing invoice clusteringizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageClusteringizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production clusteringizability tools.',
    })
  }
}
