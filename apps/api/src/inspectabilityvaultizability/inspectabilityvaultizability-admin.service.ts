import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getInspectabilityvaultizabilityRolloutGuidance,
  inspectabilityvaultizabilityAdminActionRequestSchema,
  inspectabilityvaultizabilityAdminActionResponseSchema,
  inspectabilityvaultizabilityAdminSummaryResponseSchema,
  inspectabilityvaultizabilityCapabilitiesResponseSchema,
  inspectabilityvaultizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildInspectabilityvaultizabilityAdminRecords,
  buildInspectabilityvaultizabilityAdminStats,
  getInspectabilityvaultizabilityAdminGuidance,
  resolveInspectabilityvaultizabilityAdminActions,
} from './inspectabilityvaultizability-admin.helpers.js'
import { evaluateInspectabilityvaultizabilityRollout } from './inspectabilityvaultizability-rollout.helpers.js'
import { InspectabilityvaultizabilityStatusService } from './inspectabilityvaultizability-status.service.js'

@Injectable()
export class InspectabilityvaultizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly inspectabilityvaultizabilityStatusService: InspectabilityvaultizabilityStatusService,
  ) {}

  getCapabilities() {
    return inspectabilityvaultizabilityCapabilitiesResponseSchema.parse({
      supportsInspectabilityvaultizabilityRollout: true,
      supportsInspectabilityvaultizabilityAdminTools: true,
      supportsIdempotencyKeyInspectabilityvaultizabilitySignals: true,
      supportsUsageEventInspectabilityvaultizabilitySignals: true,
      guidance: getInspectabilityvaultizabilityRolloutGuidance(),
    })
  }

  async getInspectabilityvaultizabilityRollout() {
    const inspectabilityvaultizabilityTableCoverage =
      await this.inspectabilityvaultizabilityStatusService.getInspectabilityvaultizabilityTableCoverage()

    const rollout = evaluateInspectabilityvaultizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.inspectabilityvaultizabilityStatusService.pingPostgres(),
      existingInspectabilityvaultizabilityTableCount: inspectabilityvaultizabilityTableCoverage.existingInspectabilityvaultizabilityTableCount,
      idempotencyKeysTableExists: inspectabilityvaultizabilityTableCoverage.idempotencyKeysTableExists,
      usageEventsTableExists: inspectabilityvaultizabilityTableCoverage.usageEventsTableExists,
      billingWebhookEventsTableExists: inspectabilityvaultizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return inspectabilityvaultizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceInspectabilityvaultizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageInspectabilityvaultizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.inspectabilityvaultizabilityStatusService.getWorkspaceInspectabilityvaultizabilityInventory(
        workspaceId,
      )
    const records = buildInspectabilityvaultizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.inspectabilityvaultizabilityStatusService.pingPostgres()
    const stats = buildInspectabilityvaultizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return inspectabilityvaultizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveInspectabilityvaultizabilityAdminActions(),
      guidance: getInspectabilityvaultizabilityAdminGuidance({ stats }),
    })
  }

  async executeInspectabilityvaultizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_inspectabilityvaultizability_summary'
    },
  ) {
    this.assertCanManageInspectabilityvaultizability(authContext)

    const payload = inspectabilityvaultizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_inspectabilityvaultizability_summary': {
        const summary = await this.getWorkspaceInspectabilityvaultizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return inspectabilityvaultizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed inspectabilityvaultizability summary with ${summary.stats.inspectabilityvaultizabilityPercent}% idempotency key inspectabilityvaultizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageInspectabilityvaultizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production inspectabilityvaultizability tools.',
    })
  }
}
