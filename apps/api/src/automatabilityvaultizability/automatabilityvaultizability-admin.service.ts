import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getAutomatabilityvaultizabilityRolloutGuidance,
  automatabilityvaultizabilityAdminActionRequestSchema,
  automatabilityvaultizabilityAdminActionResponseSchema,
  automatabilityvaultizabilityAdminSummaryResponseSchema,
  automatabilityvaultizabilityCapabilitiesResponseSchema,
  automatabilityvaultizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildAutomatabilityvaultizabilityAdminRecords,
  buildAutomatabilityvaultizabilityAdminStats,
  getAutomatabilityvaultizabilityAdminGuidance,
  resolveAutomatabilityvaultizabilityAdminActions,
} from './automatabilityvaultizability-admin.helpers.js'
import { evaluateAutomatabilityvaultizabilityRollout } from './automatabilityvaultizability-rollout.helpers.js'
import { AutomatabilityvaultizabilityStatusService } from './automatabilityvaultizability-status.service.js'

@Injectable()
export class AutomatabilityvaultizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly automatabilityvaultizabilityStatusService: AutomatabilityvaultizabilityStatusService,
  ) {}

  getCapabilities() {
    return automatabilityvaultizabilityCapabilitiesResponseSchema.parse({
      supportsAutomatabilityvaultizabilityRollout: true,
      supportsAutomatabilityvaultizabilityAdminTools: true,
      supportsIdempotencyKeyAutomatabilityvaultizabilitySignals: true,
      supportsUsageEventAutomatabilityvaultizabilitySignals: true,
      guidance: getAutomatabilityvaultizabilityRolloutGuidance(),
    })
  }

  async getAutomatabilityvaultizabilityRollout() {
    const automatabilityvaultizabilityTableCoverage =
      await this.automatabilityvaultizabilityStatusService.getAutomatabilityvaultizabilityTableCoverage()

    const rollout = evaluateAutomatabilityvaultizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.automatabilityvaultizabilityStatusService.pingPostgres(),
      existingAutomatabilityvaultizabilityTableCount: automatabilityvaultizabilityTableCoverage.existingAutomatabilityvaultizabilityTableCount,
      idempotencyKeysTableExists: automatabilityvaultizabilityTableCoverage.idempotencyKeysTableExists,
      usageEventsTableExists: automatabilityvaultizabilityTableCoverage.usageEventsTableExists,
      billingWebhookEventsTableExists: automatabilityvaultizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return automatabilityvaultizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceAutomatabilityvaultizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageAutomatabilityvaultizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.automatabilityvaultizabilityStatusService.getWorkspaceAutomatabilityvaultizabilityInventory(
        workspaceId,
      )
    const records = buildAutomatabilityvaultizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.automatabilityvaultizabilityStatusService.pingPostgres()
    const stats = buildAutomatabilityvaultizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return automatabilityvaultizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveAutomatabilityvaultizabilityAdminActions(),
      guidance: getAutomatabilityvaultizabilityAdminGuidance({ stats }),
    })
  }

  async executeAutomatabilityvaultizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_automatabilityvaultizability_summary'
    },
  ) {
    this.assertCanManageAutomatabilityvaultizability(authContext)

    const payload = automatabilityvaultizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_automatabilityvaultizability_summary': {
        const summary = await this.getWorkspaceAutomatabilityvaultizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return automatabilityvaultizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed automatabilityvaultizability summary with ${summary.stats.automatabilityvaultizabilityPercent}% idempotency key automatabilityvaultizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageAutomatabilityvaultizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production automatabilityvaultizability tools.',
    })
  }
}
