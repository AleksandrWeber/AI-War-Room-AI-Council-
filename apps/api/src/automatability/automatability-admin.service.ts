import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getAutomatabilityRolloutGuidance,
  automatabilityAdminActionRequestSchema,
  automatabilityAdminActionResponseSchema,
  automatabilityAdminSummaryResponseSchema,
  automatabilityCapabilitiesResponseSchema,
  automatabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildAutomatabilityAdminRecords,
  buildAutomatabilityAdminStats,
  getAutomatabilityAdminGuidance,
  resolveAutomatabilityAdminActions,
} from './automatability-admin.helpers.js'
import { evaluateAutomatabilityRollout } from './automatability-rollout.helpers.js'
import { AutomatabilityStatusService } from './automatability-status.service.js'

@Injectable()
export class AutomatabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly automatabilityStatusService: AutomatabilityStatusService,
  ) {}

  getCapabilities() {
    return automatabilityCapabilitiesResponseSchema.parse({
      supportsAutomatabilityRollout: true,
      supportsAutomatabilityAdminTools: true,
      supportsAgentOutputAutomatabilitySignals: true,
      supportsWorkflowAutomatabilitySignals: true,
      guidance: getAutomatabilityRolloutGuidance(),
    })
  }

  async getAutomatabilityRollout() {
    const automatabilityTableCoverage =
      await this.automatabilityStatusService.getAutomatabilityTableCoverage()

    const rollout = evaluateAutomatabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.automatabilityStatusService.pingPostgres(),
      existingAutomatabilityTableCount: automatabilityTableCoverage.existingAutomatabilityTableCount,
      agentOutputsTableExists: automatabilityTableCoverage.agentOutputsTableExists,
      runWorkflowsTableExists: automatabilityTableCoverage.runWorkflowsTableExists,
      artifactsTableExists: automatabilityTableCoverage.artifactsTableExists,
    })

    return automatabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceAutomatabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageAutomatability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.automatabilityStatusService.getWorkspaceAutomatabilityInventory(
        workspaceId,
      )
    const records = buildAutomatabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.automatabilityStatusService.pingPostgres()
    const stats = buildAutomatabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return automatabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveAutomatabilityAdminActions(),
      guidance: getAutomatabilityAdminGuidance({ stats }),
    })
  }

  async executeAutomatabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_automatability_summary'
    },
  ) {
    this.assertCanManageAutomatability(authContext)

    const payload = automatabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_automatability_summary': {
        const summary = await this.getWorkspaceAutomatabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return automatabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed automatability summary with ${summary.stats.automatabilityPercent}% agent output automatability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageAutomatability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production automatability tools.',
    })
  }
}
