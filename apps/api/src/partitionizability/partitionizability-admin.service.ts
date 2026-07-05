import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getPartitionizabilityRolloutGuidance,
  partitionizabilityAdminActionRequestSchema,
  partitionizabilityAdminActionResponseSchema,
  partitionizabilityAdminSummaryResponseSchema,
  partitionizabilityCapabilitiesResponseSchema,
  partitionizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildPartitionizabilityAdminRecords,
  buildPartitionizabilityAdminStats,
  getPartitionizabilityAdminGuidance,
  resolvePartitionizabilityAdminActions,
} from './partitionizability-admin.helpers.js'
import { evaluatePartitionizabilityRollout } from './partitionizability-rollout.helpers.js'
import { PartitionizabilityStatusService } from './partitionizability-status.service.js'

@Injectable()
export class PartitionizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly partitionizabilityStatusService: PartitionizabilityStatusService,
  ) {}

  getCapabilities() {
    return partitionizabilityCapabilitiesResponseSchema.parse({
      supportsPartitionizabilityRollout: true,
      supportsPartitionizabilityAdminTools: true,
      supportsShieldScanPartitionizabilitySignals: true,
      supportsProviderCredentialPartitionizabilitySignals: true,
      guidance: getPartitionizabilityRolloutGuidance(),
    })
  }

  async getPartitionizabilityRollout() {
    const partitionizabilityTableCoverage =
      await this.partitionizabilityStatusService.getPartitionizabilityTableCoverage()

    const rollout = evaluatePartitionizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.partitionizabilityStatusService.pingPostgres(),
      existingPartitionizabilityTableCount: partitionizabilityTableCoverage.existingPartitionizabilityTableCount,
      shieldScansTableExists: partitionizabilityTableCoverage.shieldScansTableExists,
      workspaceProviderCredentialsTableExists: partitionizabilityTableCoverage.workspaceProviderCredentialsTableExists,
      billingWebhookEventsTableExists: partitionizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return partitionizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspacePartitionizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManagePartitionizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.partitionizabilityStatusService.getWorkspacePartitionizabilityInventory(
        workspaceId,
      )
    const records = buildPartitionizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.partitionizabilityStatusService.pingPostgres()
    const stats = buildPartitionizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return partitionizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolvePartitionizabilityAdminActions(),
      guidance: getPartitionizabilityAdminGuidance({ stats }),
    })
  }

  async executePartitionizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_partitionizability_summary'
    },
  ) {
    this.assertCanManagePartitionizability(authContext)

    const payload = partitionizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_partitionizability_summary': {
        const summary = await this.getWorkspacePartitionizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return partitionizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed partitionizability summary with ${summary.stats.partitionizabilityPercent}% shield scan partitionizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManagePartitionizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production partitionizability tools.',
    })
  }
}
