import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getExpressivenessRolloutGuidance,
  expressivenessAdminActionRequestSchema,
  expressivenessAdminActionResponseSchema,
  expressivenessAdminSummaryResponseSchema,
  expressivenessCapabilitiesResponseSchema,
  expressivenessRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildExpressivenessAdminRecords,
  buildExpressivenessAdminStats,
  getExpressivenessAdminGuidance,
  resolveExpressivenessAdminActions,
} from './expressiveness-admin.helpers.js'
import { evaluateExpressivenessRollout } from './expressiveness-rollout.helpers.js'
import { ExpressivenessStatusService } from './expressiveness-status.service.js'

@Injectable()
export class ExpressivenessAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly expressivenessStatusService: ExpressivenessStatusService,
  ) {}

  getCapabilities() {
    return expressivenessCapabilitiesResponseSchema.parse({
      supportsExpressivenessRollout: true,
      supportsExpressivenessAdminTools: true,
      supportsAgentOutputExpressivenessSignals: true,
      supportsSynthesisExpressivenessSignals: true,
      guidance: getExpressivenessRolloutGuidance(),
    })
  }

  async getExpressivenessRollout() {
    const expressivenessTableCoverage =
      await this.expressivenessStatusService.getExpressivenessTableCoverage()

    const rollout = evaluateExpressivenessRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.expressivenessStatusService.pingPostgres(),
      existingExpressivenessTableCount: expressivenessTableCoverage.existingExpressivenessTableCount,
      agentOutputsTableExists: expressivenessTableCoverage.agentOutputsTableExists,
      moderatorSynthesesTableExists: expressivenessTableCoverage.moderatorSynthesesTableExists,
      artifactsTableExists: expressivenessTableCoverage.artifactsTableExists,
    })

    return expressivenessRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceExpressivenessAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageExpressiveness(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.expressivenessStatusService.getWorkspaceExpressivenessInventory(
        workspaceId,
      )
    const records = buildExpressivenessAdminRecords(inventoryItems)
    const postgresConnectivity = await this.expressivenessStatusService.pingPostgres()
    const stats = buildExpressivenessAdminStats({
      records,
      postgresConnectivity,
    })

    return expressivenessAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveExpressivenessAdminActions(),
      guidance: getExpressivenessAdminGuidance({ stats }),
    })
  }

  async executeExpressivenessAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_expressiveness_summary'
    },
  ) {
    this.assertCanManageExpressiveness(authContext)

    const payload = expressivenessAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_expressiveness_summary': {
        const summary = await this.getWorkspaceExpressivenessAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return expressivenessAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed expressiveness summary with ${summary.stats.expressivenessPercent}% agent output expressiveness across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageExpressiveness(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production expressiveness tools.',
    })
  }
}
