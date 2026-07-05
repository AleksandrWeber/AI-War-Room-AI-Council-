import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getDistinctivenessRolloutGuidance,
  distinctivenessAdminActionRequestSchema,
  distinctivenessAdminActionResponseSchema,
  distinctivenessAdminSummaryResponseSchema,
  distinctivenessCapabilitiesResponseSchema,
  distinctivenessRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildDistinctivenessAdminRecords,
  buildDistinctivenessAdminStats,
  getDistinctivenessAdminGuidance,
  resolveDistinctivenessAdminActions,
} from './distinctiveness-admin.helpers.js'
import { evaluateDistinctivenessRollout } from './distinctiveness-rollout.helpers.js'
import { DistinctivenessStatusService } from './distinctiveness-status.service.js'

@Injectable()
export class DistinctivenessAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly distinctivenessStatusService: DistinctivenessStatusService,
  ) {}

  getCapabilities() {
    return distinctivenessCapabilitiesResponseSchema.parse({
      supportsDistinctivenessRollout: true,
      supportsDistinctivenessAdminTools: true,
      supportsIdempotencyKeyDistinctivenessSignals: true,
      supportsUsageEventDistinctivenessSignals: true,
      guidance: getDistinctivenessRolloutGuidance(),
    })
  }

  async getDistinctivenessRollout() {
    const distinctivenessTableCoverage =
      await this.distinctivenessStatusService.getDistinctivenessTableCoverage()

    const rollout = evaluateDistinctivenessRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.distinctivenessStatusService.pingPostgres(),
      existingDistinctivenessTableCount: distinctivenessTableCoverage.existingDistinctivenessTableCount,
      idempotencyKeysTableExists: distinctivenessTableCoverage.idempotencyKeysTableExists,
      usageEventsTableExists: distinctivenessTableCoverage.usageEventsTableExists,
      billingWebhookEventsTableExists: distinctivenessTableCoverage.billingWebhookEventsTableExists,
    })

    return distinctivenessRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceDistinctivenessAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageDistinctiveness(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.distinctivenessStatusService.getWorkspaceDistinctivenessInventory(
        workspaceId,
      )
    const records = buildDistinctivenessAdminRecords(inventoryItems)
    const postgresConnectivity = await this.distinctivenessStatusService.pingPostgres()
    const stats = buildDistinctivenessAdminStats({
      records,
      postgresConnectivity,
    })

    return distinctivenessAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveDistinctivenessAdminActions(),
      guidance: getDistinctivenessAdminGuidance({ stats }),
    })
  }

  async executeDistinctivenessAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_distinctiveness_summary'
    },
  ) {
    this.assertCanManageDistinctiveness(authContext)

    const payload = distinctivenessAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_distinctiveness_summary': {
        const summary = await this.getWorkspaceDistinctivenessAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return distinctivenessAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed distinctiveness summary with ${summary.stats.distinctivenessPercent}% idempotency key distinctiveness across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageDistinctiveness(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production distinctiveness tools.',
    })
  }
}
