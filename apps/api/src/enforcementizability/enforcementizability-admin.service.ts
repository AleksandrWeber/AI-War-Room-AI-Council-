import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getEnforcementizabilityRolloutGuidance,
  enforcementizabilityAdminActionRequestSchema,
  enforcementizabilityAdminActionResponseSchema,
  enforcementizabilityAdminSummaryResponseSchema,
  enforcementizabilityCapabilitiesResponseSchema,
  enforcementizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildEnforcementizabilityAdminRecords,
  buildEnforcementizabilityAdminStats,
  getEnforcementizabilityAdminGuidance,
  resolveEnforcementizabilityAdminActions,
} from './enforcementizability-admin.helpers.js'
import { evaluateEnforcementizabilityRollout } from './enforcementizability-rollout.helpers.js'
import { EnforcementizabilityStatusService } from './enforcementizability-status.service.js'

@Injectable()
export class EnforcementizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly enforcementizabilityStatusService: EnforcementizabilityStatusService,
  ) {}

  getCapabilities() {
    return enforcementizabilityCapabilitiesResponseSchema.parse({
      supportsEnforcementizabilityRollout: true,
      supportsEnforcementizabilityAdminTools: true,
      supportsIdempotencyKeyEnforcementizabilitySignals: true,
      supportsUsageEventEnforcementizabilitySignals: true,
      guidance: getEnforcementizabilityRolloutGuidance(),
    })
  }

  async getEnforcementizabilityRollout() {
    const enforcementizabilityTableCoverage =
      await this.enforcementizabilityStatusService.getEnforcementizabilityTableCoverage()

    const rollout = evaluateEnforcementizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.enforcementizabilityStatusService.pingPostgres(),
      existingEnforcementizabilityTableCount: enforcementizabilityTableCoverage.existingEnforcementizabilityTableCount,
      idempotencyKeysTableExists: enforcementizabilityTableCoverage.idempotencyKeysTableExists,
      usageEventsTableExists: enforcementizabilityTableCoverage.usageEventsTableExists,
      billingWebhookEventsTableExists: enforcementizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return enforcementizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceEnforcementizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageEnforcementizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.enforcementizabilityStatusService.getWorkspaceEnforcementizabilityInventory(
        workspaceId,
      )
    const records = buildEnforcementizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.enforcementizabilityStatusService.pingPostgres()
    const stats = buildEnforcementizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return enforcementizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveEnforcementizabilityAdminActions(),
      guidance: getEnforcementizabilityAdminGuidance({ stats }),
    })
  }

  async executeEnforcementizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_enforcementizability_summary'
    },
  ) {
    this.assertCanManageEnforcementizability(authContext)

    const payload = enforcementizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_enforcementizability_summary': {
        const summary = await this.getWorkspaceEnforcementizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return enforcementizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed enforcementizability summary with ${summary.stats.enforcementizabilityPercent}% idempotency key enforcementizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageEnforcementizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production enforcementizability tools.',
    })
  }
}
