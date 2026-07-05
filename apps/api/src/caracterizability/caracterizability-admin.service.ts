import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getCaracterizabilityRolloutGuidance,
  caracterizabilityAdminActionRequestSchema,
  caracterizabilityAdminActionResponseSchema,
  caracterizabilityAdminSummaryResponseSchema,
  caracterizabilityCapabilitiesResponseSchema,
  caracterizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildCaracterizabilityAdminRecords,
  buildCaracterizabilityAdminStats,
  getCaracterizabilityAdminGuidance,
  resolveCaracterizabilityAdminActions,
} from './caracterizability-admin.helpers.js'
import { evaluateCaracterizabilityRollout } from './caracterizability-rollout.helpers.js'
import { CaracterizabilityStatusService } from './caracterizability-status.service.js'

@Injectable()
export class CaracterizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly caracterizabilityStatusService: CaracterizabilityStatusService,
  ) {}

  getCapabilities() {
    return caracterizabilityCapabilitiesResponseSchema.parse({
      supportsCaracterizabilityRollout: true,
      supportsCaracterizabilityAdminTools: true,
      supportsWorkflowCaracterizabilitySignals: true,
      supportsAgentOutputCaracterizabilitySignals: true,
      guidance: getCaracterizabilityRolloutGuidance(),
    })
  }

  async getCaracterizabilityRollout() {
    const caracterizabilityTableCoverage =
      await this.caracterizabilityStatusService.getCaracterizabilityTableCoverage()

    const rollout = evaluateCaracterizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.caracterizabilityStatusService.pingPostgres(),
      existingCaracterizabilityTableCount: caracterizabilityTableCoverage.existingCaracterizabilityTableCount,
      runWorkflowsTableExists: caracterizabilityTableCoverage.runWorkflowsTableExists,
      agentOutputsTableExists: caracterizabilityTableCoverage.agentOutputsTableExists,
      moderatorSynthesesTableExists: caracterizabilityTableCoverage.moderatorSynthesesTableExists,
    })

    return caracterizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceCaracterizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageCaracterizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.caracterizabilityStatusService.getWorkspaceCaracterizabilityInventory(
        workspaceId,
      )
    const records = buildCaracterizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.caracterizabilityStatusService.pingPostgres()
    const stats = buildCaracterizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return caracterizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveCaracterizabilityAdminActions(),
      guidance: getCaracterizabilityAdminGuidance({ stats }),
    })
  }

  async executeCaracterizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_caracterizability_summary'
    },
  ) {
    this.assertCanManageCaracterizability(authContext)

    const payload = caracterizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_caracterizability_summary': {
        const summary = await this.getWorkspaceCaracterizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return caracterizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed caracterizability summary with ${summary.stats.caracterizabilityPercent}% workflow caracterizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageCaracterizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production caracterizability tools.',
    })
  }
}
