import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getOrchestrabilityRolloutGuidance,
  orchestrabilityAdminActionRequestSchema,
  orchestrabilityAdminActionResponseSchema,
  orchestrabilityAdminSummaryResponseSchema,
  orchestrabilityCapabilitiesResponseSchema,
  orchestrabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildOrchestrabilityAdminRecords,
  buildOrchestrabilityAdminStats,
  getOrchestrabilityAdminGuidance,
  resolveOrchestrabilityAdminActions,
} from './orchestrability-admin.helpers.js'
import { evaluateOrchestrabilityRollout } from './orchestrability-rollout.helpers.js'
import { OrchestrabilityStatusService } from './orchestrability-status.service.js'

@Injectable()
export class OrchestrabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly orchestrabilityStatusService: OrchestrabilityStatusService,
  ) {}

  getCapabilities() {
    return orchestrabilityCapabilitiesResponseSchema.parse({
      supportsOrchestrabilityRollout: true,
      supportsOrchestrabilityAdminTools: true,
      supportsWorkflowOrchestrabilitySignals: true,
      supportsSynthesisOrchestrabilitySignals: true,
      guidance: getOrchestrabilityRolloutGuidance(),
    })
  }

  async getOrchestrabilityRollout() {
    const orchestrabilityTableCoverage =
      await this.orchestrabilityStatusService.getOrchestrabilityTableCoverage()

    const rollout = evaluateOrchestrabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.orchestrabilityStatusService.pingPostgres(),
      existingOrchestrabilityTableCount: orchestrabilityTableCoverage.existingOrchestrabilityTableCount,
      runWorkflowsTableExists: orchestrabilityTableCoverage.runWorkflowsTableExists,
      moderatorSynthesesTableExists: orchestrabilityTableCoverage.moderatorSynthesesTableExists,
      billingNotificationsTableExists: orchestrabilityTableCoverage.billingNotificationsTableExists,
    })

    return orchestrabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceOrchestrabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageOrchestrability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.orchestrabilityStatusService.getWorkspaceOrchestrabilityInventory(
        workspaceId,
      )
    const records = buildOrchestrabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.orchestrabilityStatusService.pingPostgres()
    const stats = buildOrchestrabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return orchestrabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveOrchestrabilityAdminActions(),
      guidance: getOrchestrabilityAdminGuidance({ stats }),
    })
  }

  async executeOrchestrabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_orchestrability_summary'
    },
  ) {
    this.assertCanManageOrchestrability(authContext)

    const payload = orchestrabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_orchestrability_summary': {
        const summary = await this.getWorkspaceOrchestrabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return orchestrabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed orchestrability summary with ${summary.stats.orchestrabilityPercent}% workflow orchestrability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageOrchestrability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production orchestrability tools.',
    })
  }
}
