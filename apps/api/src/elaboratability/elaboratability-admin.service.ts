import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getElaboratabilityRolloutGuidance,
  elaboratabilityAdminActionRequestSchema,
  elaboratabilityAdminActionResponseSchema,
  elaboratabilityAdminSummaryResponseSchema,
  elaboratabilityCapabilitiesResponseSchema,
  elaboratabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildElaboratabilityAdminRecords,
  buildElaboratabilityAdminStats,
  getElaboratabilityAdminGuidance,
  resolveElaboratabilityAdminActions,
} from './elaboratability-admin.helpers.js'
import { evaluateElaboratabilityRollout } from './elaboratability-rollout.helpers.js'
import { ElaboratabilityStatusService } from './elaboratability-status.service.js'

@Injectable()
export class ElaboratabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly elaboratabilityStatusService: ElaboratabilityStatusService,
  ) {}

  getCapabilities() {
    return elaboratabilityCapabilitiesResponseSchema.parse({
      supportsElaboratabilityRollout: true,
      supportsElaboratabilityAdminTools: true,
      supportsWorkflowElaboratabilitySignals: true,
      supportsAgentOutputElaboratabilitySignals: true,
      guidance: getElaboratabilityRolloutGuidance(),
    })
  }

  async getElaboratabilityRollout() {
    const elaboratabilityTableCoverage =
      await this.elaboratabilityStatusService.getElaboratabilityTableCoverage()

    const rollout = evaluateElaboratabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.elaboratabilityStatusService.pingPostgres(),
      existingElaboratabilityTableCount: elaboratabilityTableCoverage.existingElaboratabilityTableCount,
      runWorkflowsTableExists: elaboratabilityTableCoverage.runWorkflowsTableExists,
      agentOutputsTableExists: elaboratabilityTableCoverage.agentOutputsTableExists,
      moderatorSynthesesTableExists: elaboratabilityTableCoverage.moderatorSynthesesTableExists,
    })

    return elaboratabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceElaboratabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageElaboratability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.elaboratabilityStatusService.getWorkspaceElaboratabilityInventory(
        workspaceId,
      )
    const records = buildElaboratabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.elaboratabilityStatusService.pingPostgres()
    const stats = buildElaboratabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return elaboratabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveElaboratabilityAdminActions(),
      guidance: getElaboratabilityAdminGuidance({ stats }),
    })
  }

  async executeElaboratabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_elaboratability_summary'
    },
  ) {
    this.assertCanManageElaboratability(authContext)

    const payload = elaboratabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_elaboratability_summary': {
        const summary = await this.getWorkspaceElaboratabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return elaboratabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed elaboratability summary with ${summary.stats.elaboratabilityPercent}% workflow elaboratability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageElaboratability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production elaboratability tools.',
    })
  }
}
