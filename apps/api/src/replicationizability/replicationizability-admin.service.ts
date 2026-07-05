import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getReplicationizabilityRolloutGuidance,
  replicationizabilityAdminActionRequestSchema,
  replicationizabilityAdminActionResponseSchema,
  replicationizabilityAdminSummaryResponseSchema,
  replicationizabilityCapabilitiesResponseSchema,
  replicationizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildReplicationizabilityAdminRecords,
  buildReplicationizabilityAdminStats,
  getReplicationizabilityAdminGuidance,
  resolveReplicationizabilityAdminActions,
} from './replicationizability-admin.helpers.js'
import { evaluateReplicationizabilityRollout } from './replicationizability-rollout.helpers.js'
import { ReplicationizabilityStatusService } from './replicationizability-status.service.js'

@Injectable()
export class ReplicationizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly replicationizabilityStatusService: ReplicationizabilityStatusService,
  ) {}

  getCapabilities() {
    return replicationizabilityCapabilitiesResponseSchema.parse({
      supportsReplicationizabilityRollout: true,
      supportsReplicationizabilityAdminTools: true,
      supportsBillingWebhookReplicationizabilitySignals: true,
      supportsBillingRecordReplicationizabilitySignals: true,
      guidance: getReplicationizabilityRolloutGuidance(),
    })
  }

  async getReplicationizabilityRollout() {
    const replicationizabilityTableCoverage =
      await this.replicationizabilityStatusService.getReplicationizabilityTableCoverage()

    const rollout = evaluateReplicationizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.replicationizabilityStatusService.pingPostgres(),
      existingReplicationizabilityTableCount: replicationizabilityTableCoverage.existingReplicationizabilityTableCount,
      billingWebhookEventsTableExists: replicationizabilityTableCoverage.billingWebhookEventsTableExists,
      billingRecordsTableExists: replicationizabilityTableCoverage.billingRecordsTableExists,
      usageEventsTableExists: replicationizabilityTableCoverage.usageEventsTableExists,
    })

    return replicationizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceReplicationizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageReplicationizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.replicationizabilityStatusService.getWorkspaceReplicationizabilityInventory(
        workspaceId,
      )
    const records = buildReplicationizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.replicationizabilityStatusService.pingPostgres()
    const stats = buildReplicationizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return replicationizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveReplicationizabilityAdminActions(),
      guidance: getReplicationizabilityAdminGuidance({ stats }),
    })
  }

  async executeReplicationizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_replicationizability_summary'
    },
  ) {
    this.assertCanManageReplicationizability(authContext)

    const payload = replicationizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_replicationizability_summary': {
        const summary = await this.getWorkspaceReplicationizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return replicationizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed replicationizability summary with ${summary.stats.replicationizabilityPercent}% billing webhook replicationizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageReplicationizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production replicationizability tools.',
    })
  }
}
