import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getPortabilityRolloutGuidance,
  portabilityAdminActionRequestSchema,
  portabilityAdminActionResponseSchema,
  portabilityAdminSummaryResponseSchema,
  portabilityCapabilitiesResponseSchema,
  portabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildPortabilityAdminRecords,
  buildPortabilityAdminStats,
  getPortabilityAdminGuidance,
  resolvePortabilityAdminActions,
} from './portability-admin.helpers.js'
import { evaluatePortabilityRollout } from './portability-rollout.helpers.js'
import { PortabilityStatusService } from './portability-status.service.js'

@Injectable()
export class PortabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly portabilityStatusService: PortabilityStatusService,
  ) {}

  getCapabilities() {
    return portabilityCapabilitiesResponseSchema.parse({
      supportsPortabilityRollout: true,
      supportsPortabilityAdminTools: true,
      supportsArtifactPortabilitySignals: true,
      supportsAgentOutputPortabilitySignals: true,
      guidance: getPortabilityRolloutGuidance(),
    })
  }

  async getPortabilityRollout() {
    const portabilityTableCoverage =
      await this.portabilityStatusService.getPortabilityTableCoverage()

    const rollout = evaluatePortabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.portabilityStatusService.pingPostgres(),
      existingPortabilityTableCount: portabilityTableCoverage.existingPortabilityTableCount,
      artifactsTableExists: portabilityTableCoverage.artifactsTableExists,
      agentOutputsTableExists: portabilityTableCoverage.agentOutputsTableExists,
      moderatorSynthesesTableExists: portabilityTableCoverage.moderatorSynthesesTableExists,
    })

    return portabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspacePortabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManagePortability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.portabilityStatusService.getWorkspacePortabilityInventory(
        workspaceId,
      )
    const records = buildPortabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.portabilityStatusService.pingPostgres()
    const stats = buildPortabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return portabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolvePortabilityAdminActions(),
      guidance: getPortabilityAdminGuidance({ stats }),
    })
  }

  async executePortabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_portability_summary'
    },
  ) {
    this.assertCanManagePortability(authContext)

    const payload = portabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_portability_summary': {
        const summary = await this.getWorkspacePortabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return portabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed portability summary with ${summary.stats.portabilityPercent}% artifact portability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManagePortability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production portability tools.',
    })
  }
}
