import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getComparabilityvaultizabilityRolloutGuidance,
  comparabilityvaultizabilityAdminActionRequestSchema,
  comparabilityvaultizabilityAdminActionResponseSchema,
  comparabilityvaultizabilityAdminSummaryResponseSchema,
  comparabilityvaultizabilityCapabilitiesResponseSchema,
  comparabilityvaultizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildComparabilityvaultizabilityAdminRecords,
  buildComparabilityvaultizabilityAdminStats,
  getComparabilityvaultizabilityAdminGuidance,
  resolveComparabilityvaultizabilityAdminActions,
} from './comparabilityvaultizability-admin.helpers.js'
import { evaluateComparabilityvaultizabilityRollout } from './comparabilityvaultizability-rollout.helpers.js'
import { ComparabilityvaultizabilityStatusService } from './comparabilityvaultizability-status.service.js'

@Injectable()
export class ComparabilityvaultizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly comparabilityvaultizabilityStatusService: ComparabilityvaultizabilityStatusService,
  ) {}

  getCapabilities() {
    return comparabilityvaultizabilityCapabilitiesResponseSchema.parse({
      supportsComparabilityvaultizabilityRollout: true,
      supportsComparabilityvaultizabilityAdminTools: true,
      supportsIdempotencyKeyComparabilityvaultizabilitySignals: true,
      supportsUsageEventComparabilityvaultizabilitySignals: true,
      guidance: getComparabilityvaultizabilityRolloutGuidance(),
    })
  }

  async getComparabilityvaultizabilityRollout() {
    const comparabilityvaultizabilityTableCoverage =
      await this.comparabilityvaultizabilityStatusService.getComparabilityvaultizabilityTableCoverage()

    const rollout = evaluateComparabilityvaultizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.comparabilityvaultizabilityStatusService.pingPostgres(),
      existingComparabilityvaultizabilityTableCount: comparabilityvaultizabilityTableCoverage.existingComparabilityvaultizabilityTableCount,
      idempotencyKeysTableExists: comparabilityvaultizabilityTableCoverage.idempotencyKeysTableExists,
      usageEventsTableExists: comparabilityvaultizabilityTableCoverage.usageEventsTableExists,
      billingWebhookEventsTableExists: comparabilityvaultizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return comparabilityvaultizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceComparabilityvaultizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageComparabilityvaultizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.comparabilityvaultizabilityStatusService.getWorkspaceComparabilityvaultizabilityInventory(
        workspaceId,
      )
    const records = buildComparabilityvaultizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.comparabilityvaultizabilityStatusService.pingPostgres()
    const stats = buildComparabilityvaultizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return comparabilityvaultizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveComparabilityvaultizabilityAdminActions(),
      guidance: getComparabilityvaultizabilityAdminGuidance({ stats }),
    })
  }

  async executeComparabilityvaultizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_comparabilityvaultizability_summary'
    },
  ) {
    this.assertCanManageComparabilityvaultizability(authContext)

    const payload = comparabilityvaultizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_comparabilityvaultizability_summary': {
        const summary = await this.getWorkspaceComparabilityvaultizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return comparabilityvaultizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed comparabilityvaultizability summary with ${summary.stats.comparabilityvaultizabilityPercent}% idempotency key comparabilityvaultizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageComparabilityvaultizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production comparabilityvaultizability tools.',
    })
  }
}
