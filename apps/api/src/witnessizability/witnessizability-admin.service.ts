import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getWitnessizabilityRolloutGuidance,
  witnessizabilityAdminActionRequestSchema,
  witnessizabilityAdminActionResponseSchema,
  witnessizabilityAdminSummaryResponseSchema,
  witnessizabilityCapabilitiesResponseSchema,
  witnessizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildWitnessizabilityAdminRecords,
  buildWitnessizabilityAdminStats,
  getWitnessizabilityAdminGuidance,
  resolveWitnessizabilityAdminActions,
} from './witnessizability-admin.helpers.js'
import { evaluateWitnessizabilityRollout } from './witnessizability-rollout.helpers.js'
import { WitnessizabilityStatusService } from './witnessizability-status.service.js'

@Injectable()
export class WitnessizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly witnessizabilityStatusService: WitnessizabilityStatusService,
  ) {}

  getCapabilities() {
    return witnessizabilityCapabilitiesResponseSchema.parse({
      supportsWitnessizabilityRollout: true,
      supportsWitnessizabilityAdminTools: true,
      supportsIdempotencyKeyWitnessizabilitySignals: true,
      supportsUsageEventWitnessizabilitySignals: true,
      guidance: getWitnessizabilityRolloutGuidance(),
    })
  }

  async getWitnessizabilityRollout() {
    const witnessizabilityTableCoverage =
      await this.witnessizabilityStatusService.getWitnessizabilityTableCoverage()

    const rollout = evaluateWitnessizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.witnessizabilityStatusService.pingPostgres(),
      existingWitnessizabilityTableCount: witnessizabilityTableCoverage.existingWitnessizabilityTableCount,
      idempotencyKeysTableExists: witnessizabilityTableCoverage.idempotencyKeysTableExists,
      usageEventsTableExists: witnessizabilityTableCoverage.usageEventsTableExists,
      billingWebhookEventsTableExists: witnessizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return witnessizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceWitnessizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageWitnessizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.witnessizabilityStatusService.getWorkspaceWitnessizabilityInventory(
        workspaceId,
      )
    const records = buildWitnessizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.witnessizabilityStatusService.pingPostgres()
    const stats = buildWitnessizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return witnessizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveWitnessizabilityAdminActions(),
      guidance: getWitnessizabilityAdminGuidance({ stats }),
    })
  }

  async executeWitnessizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_witnessizability_summary'
    },
  ) {
    this.assertCanManageWitnessizability(authContext)

    const payload = witnessizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_witnessizability_summary': {
        const summary = await this.getWorkspaceWitnessizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return witnessizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed witnessizability summary with ${summary.stats.witnessizabilityPercent}% idempotency key witnessizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageWitnessizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production witnessizability tools.',
    })
  }
}
