import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getDemonstrabilityvaultizabilityRolloutGuidance,
  demonstrabilityvaultizabilityAdminActionRequestSchema,
  demonstrabilityvaultizabilityAdminActionResponseSchema,
  demonstrabilityvaultizabilityAdminSummaryResponseSchema,
  demonstrabilityvaultizabilityCapabilitiesResponseSchema,
  demonstrabilityvaultizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildDemonstrabilityvaultizabilityAdminRecords,
  buildDemonstrabilityvaultizabilityAdminStats,
  getDemonstrabilityvaultizabilityAdminGuidance,
  resolveDemonstrabilityvaultizabilityAdminActions,
} from './demonstrabilityvaultizability-admin.helpers.js'
import { evaluateDemonstrabilityvaultizabilityRollout } from './demonstrabilityvaultizability-rollout.helpers.js'
import { DemonstrabilityvaultizabilityStatusService } from './demonstrabilityvaultizability-status.service.js'

@Injectable()
export class DemonstrabilityvaultizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly demonstrabilityvaultizabilityStatusService: DemonstrabilityvaultizabilityStatusService,
  ) {}

  getCapabilities() {
    return demonstrabilityvaultizabilityCapabilitiesResponseSchema.parse({
      supportsDemonstrabilityvaultizabilityRollout: true,
      supportsDemonstrabilityvaultizabilityAdminTools: true,
      supportsIdempotencyKeyDemonstrabilityvaultizabilitySignals: true,
      supportsUsageEventDemonstrabilityvaultizabilitySignals: true,
      guidance: getDemonstrabilityvaultizabilityRolloutGuidance(),
    })
  }

  async getDemonstrabilityvaultizabilityRollout() {
    const demonstrabilityvaultizabilityTableCoverage =
      await this.demonstrabilityvaultizabilityStatusService.getDemonstrabilityvaultizabilityTableCoverage()

    const rollout = evaluateDemonstrabilityvaultizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.demonstrabilityvaultizabilityStatusService.pingPostgres(),
      existingDemonstrabilityvaultizabilityTableCount: demonstrabilityvaultizabilityTableCoverage.existingDemonstrabilityvaultizabilityTableCount,
      idempotencyKeysTableExists: demonstrabilityvaultizabilityTableCoverage.idempotencyKeysTableExists,
      usageEventsTableExists: demonstrabilityvaultizabilityTableCoverage.usageEventsTableExists,
      billingWebhookEventsTableExists: demonstrabilityvaultizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return demonstrabilityvaultizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceDemonstrabilityvaultizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageDemonstrabilityvaultizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.demonstrabilityvaultizabilityStatusService.getWorkspaceDemonstrabilityvaultizabilityInventory(
        workspaceId,
      )
    const records = buildDemonstrabilityvaultizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.demonstrabilityvaultizabilityStatusService.pingPostgres()
    const stats = buildDemonstrabilityvaultizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return demonstrabilityvaultizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveDemonstrabilityvaultizabilityAdminActions(),
      guidance: getDemonstrabilityvaultizabilityAdminGuidance({ stats }),
    })
  }

  async executeDemonstrabilityvaultizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_demonstrabilityvaultizability_summary'
    },
  ) {
    this.assertCanManageDemonstrabilityvaultizability(authContext)

    const payload = demonstrabilityvaultizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_demonstrabilityvaultizability_summary': {
        const summary = await this.getWorkspaceDemonstrabilityvaultizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return demonstrabilityvaultizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed demonstrabilityvaultizability summary with ${summary.stats.demonstrabilityvaultizabilityPercent}% idempotency key demonstrabilityvaultizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageDemonstrabilityvaultizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production demonstrabilityvaultizability tools.',
    })
  }
}
