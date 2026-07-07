import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getRetrievabilityvaultizabilityRolloutGuidance,
  retrievabilityvaultizabilityAdminActionRequestSchema,
  retrievabilityvaultizabilityAdminActionResponseSchema,
  retrievabilityvaultizabilityAdminSummaryResponseSchema,
  retrievabilityvaultizabilityCapabilitiesResponseSchema,
  retrievabilityvaultizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildRetrievabilityvaultizabilityAdminRecords,
  buildRetrievabilityvaultizabilityAdminStats,
  getRetrievabilityvaultizabilityAdminGuidance,
  resolveRetrievabilityvaultizabilityAdminActions,
} from './retrievabilityvaultizability-admin.helpers.js'
import { evaluateRetrievabilityvaultizabilityRollout } from './retrievabilityvaultizability-rollout.helpers.js'
import { RetrievabilityvaultizabilityStatusService } from './retrievabilityvaultizability-status.service.js'

@Injectable()
export class RetrievabilityvaultizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly retrievabilityvaultizabilityStatusService: RetrievabilityvaultizabilityStatusService,
  ) {}

  getCapabilities() {
    return retrievabilityvaultizabilityCapabilitiesResponseSchema.parse({
      supportsRetrievabilityvaultizabilityRollout: true,
      supportsRetrievabilityvaultizabilityAdminTools: true,
      supportsIdempotencyKeyRetrievabilityvaultizabilitySignals: true,
      supportsUsageEventRetrievabilityvaultizabilitySignals: true,
      guidance: getRetrievabilityvaultizabilityRolloutGuidance(),
    })
  }

  async getRetrievabilityvaultizabilityRollout() {
    const retrievabilityvaultizabilityTableCoverage =
      await this.retrievabilityvaultizabilityStatusService.getRetrievabilityvaultizabilityTableCoverage()

    const rollout = evaluateRetrievabilityvaultizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.retrievabilityvaultizabilityStatusService.pingPostgres(),
      existingRetrievabilityvaultizabilityTableCount: retrievabilityvaultizabilityTableCoverage.existingRetrievabilityvaultizabilityTableCount,
      idempotencyKeysTableExists: retrievabilityvaultizabilityTableCoverage.idempotencyKeysTableExists,
      usageEventsTableExists: retrievabilityvaultizabilityTableCoverage.usageEventsTableExists,
      billingWebhookEventsTableExists: retrievabilityvaultizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return retrievabilityvaultizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceRetrievabilityvaultizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageRetrievabilityvaultizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.retrievabilityvaultizabilityStatusService.getWorkspaceRetrievabilityvaultizabilityInventory(
        workspaceId,
      )
    const records = buildRetrievabilityvaultizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.retrievabilityvaultizabilityStatusService.pingPostgres()
    const stats = buildRetrievabilityvaultizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return retrievabilityvaultizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveRetrievabilityvaultizabilityAdminActions(),
      guidance: getRetrievabilityvaultizabilityAdminGuidance({ stats }),
    })
  }

  async executeRetrievabilityvaultizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_retrievabilityvaultizability_summary'
    },
  ) {
    this.assertCanManageRetrievabilityvaultizability(authContext)

    const payload = retrievabilityvaultizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_retrievabilityvaultizability_summary': {
        const summary = await this.getWorkspaceRetrievabilityvaultizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return retrievabilityvaultizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed retrievabilityvaultizability summary with ${summary.stats.retrievabilityvaultizabilityPercent}% idempotency key retrievabilityvaultizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageRetrievabilityvaultizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production retrievabilityvaultizability tools.',
    })
  }
}
