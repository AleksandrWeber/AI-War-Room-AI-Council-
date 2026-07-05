import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getPipeliningizabilityRolloutGuidance,
  pipeliningizabilityAdminActionRequestSchema,
  pipeliningizabilityAdminActionResponseSchema,
  pipeliningizabilityAdminSummaryResponseSchema,
  pipeliningizabilityCapabilitiesResponseSchema,
  pipeliningizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildPipeliningizabilityAdminRecords,
  buildPipeliningizabilityAdminStats,
  getPipeliningizabilityAdminGuidance,
  resolvePipeliningizabilityAdminActions,
} from './pipeliningizability-admin.helpers.js'
import { evaluatePipeliningizabilityRollout } from './pipeliningizability-rollout.helpers.js'
import { PipeliningizabilityStatusService } from './pipeliningizability-status.service.js'

@Injectable()
export class PipeliningizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly pipeliningizabilityStatusService: PipeliningizabilityStatusService,
  ) {}

  getCapabilities() {
    return pipeliningizabilityCapabilitiesResponseSchema.parse({
      supportsPipeliningizabilityRollout: true,
      supportsPipeliningizabilityAdminTools: true,
      supportsIdempotencyKeyPipeliningizabilitySignals: true,
      supportsUsageEventPipeliningizabilitySignals: true,
      guidance: getPipeliningizabilityRolloutGuidance(),
    })
  }

  async getPipeliningizabilityRollout() {
    const pipeliningizabilityTableCoverage =
      await this.pipeliningizabilityStatusService.getPipeliningizabilityTableCoverage()

    const rollout = evaluatePipeliningizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.pipeliningizabilityStatusService.pingPostgres(),
      existingPipeliningizabilityTableCount: pipeliningizabilityTableCoverage.existingPipeliningizabilityTableCount,
      idempotencyKeysTableExists: pipeliningizabilityTableCoverage.idempotencyKeysTableExists,
      usageEventsTableExists: pipeliningizabilityTableCoverage.usageEventsTableExists,
      billingWebhookEventsTableExists: pipeliningizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return pipeliningizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspacePipeliningizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManagePipeliningizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.pipeliningizabilityStatusService.getWorkspacePipeliningizabilityInventory(
        workspaceId,
      )
    const records = buildPipeliningizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.pipeliningizabilityStatusService.pingPostgres()
    const stats = buildPipeliningizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return pipeliningizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolvePipeliningizabilityAdminActions(),
      guidance: getPipeliningizabilityAdminGuidance({ stats }),
    })
  }

  async executePipeliningizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_pipeliningizability_summary'
    },
  ) {
    this.assertCanManagePipeliningizability(authContext)

    const payload = pipeliningizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_pipeliningizability_summary': {
        const summary = await this.getWorkspacePipeliningizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return pipeliningizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed pipeliningizability summary with ${summary.stats.pipeliningizabilityPercent}% idempotency key pipeliningizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManagePipeliningizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production pipeliningizability tools.',
    })
  }
}
