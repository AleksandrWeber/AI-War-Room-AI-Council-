import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getElasticizabilityRolloutGuidance,
  elasticizabilityAdminActionRequestSchema,
  elasticizabilityAdminActionResponseSchema,
  elasticizabilityAdminSummaryResponseSchema,
  elasticizabilityCapabilitiesResponseSchema,
  elasticizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildElasticizabilityAdminRecords,
  buildElasticizabilityAdminStats,
  getElasticizabilityAdminGuidance,
  resolveElasticizabilityAdminActions,
} from './elasticizability-admin.helpers.js'
import { evaluateElasticizabilityRollout } from './elasticizability-rollout.helpers.js'
import { ElasticizabilityStatusService } from './elasticizability-status.service.js'

@Injectable()
export class ElasticizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly elasticizabilityStatusService: ElasticizabilityStatusService,
  ) {}

  getCapabilities() {
    return elasticizabilityCapabilitiesResponseSchema.parse({
      supportsElasticizabilityRollout: true,
      supportsElasticizabilityAdminTools: true,
      supportsIdempotencyKeyElasticizabilitySignals: true,
      supportsUsageEventElasticizabilitySignals: true,
      guidance: getElasticizabilityRolloutGuidance(),
    })
  }

  async getElasticizabilityRollout() {
    const elasticizabilityTableCoverage =
      await this.elasticizabilityStatusService.getElasticizabilityTableCoverage()

    const rollout = evaluateElasticizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.elasticizabilityStatusService.pingPostgres(),
      existingElasticizabilityTableCount: elasticizabilityTableCoverage.existingElasticizabilityTableCount,
      idempotencyKeysTableExists: elasticizabilityTableCoverage.idempotencyKeysTableExists,
      usageEventsTableExists: elasticizabilityTableCoverage.usageEventsTableExists,
      billingWebhookEventsTableExists: elasticizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return elasticizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceElasticizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageElasticizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.elasticizabilityStatusService.getWorkspaceElasticizabilityInventory(
        workspaceId,
      )
    const records = buildElasticizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.elasticizabilityStatusService.pingPostgres()
    const stats = buildElasticizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return elasticizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveElasticizabilityAdminActions(),
      guidance: getElasticizabilityAdminGuidance({ stats }),
    })
  }

  async executeElasticizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_elasticizability_summary'
    },
  ) {
    this.assertCanManageElasticizability(authContext)

    const payload = elasticizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_elasticizability_summary': {
        const summary = await this.getWorkspaceElasticizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return elasticizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed elasticizability summary with ${summary.stats.elasticizabilityPercent}% idempotency key elasticizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageElasticizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production elasticizability tools.',
    })
  }
}
