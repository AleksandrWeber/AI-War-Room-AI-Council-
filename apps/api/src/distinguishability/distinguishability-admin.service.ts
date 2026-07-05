import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getDistinguishabilityRolloutGuidance,
  distinguishabilityAdminActionRequestSchema,
  distinguishabilityAdminActionResponseSchema,
  distinguishabilityAdminSummaryResponseSchema,
  distinguishabilityCapabilitiesResponseSchema,
  distinguishabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildDistinguishabilityAdminRecords,
  buildDistinguishabilityAdminStats,
  getDistinguishabilityAdminGuidance,
  resolveDistinguishabilityAdminActions,
} from './distinguishability-admin.helpers.js'
import { evaluateDistinguishabilityRollout } from './distinguishability-rollout.helpers.js'
import { DistinguishabilityStatusService } from './distinguishability-status.service.js'

@Injectable()
export class DistinguishabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly distinguishabilityStatusService: DistinguishabilityStatusService,
  ) {}

  getCapabilities() {
    return distinguishabilityCapabilitiesResponseSchema.parse({
      supportsDistinguishabilityRollout: true,
      supportsDistinguishabilityAdminTools: true,
      supportsSynthesisDistinguishabilitySignals: true,
      supportsAgentOutputDistinguishabilitySignals: true,
      guidance: getDistinguishabilityRolloutGuidance(),
    })
  }

  async getDistinguishabilityRollout() {
    const distinguishabilityTableCoverage =
      await this.distinguishabilityStatusService.getDistinguishabilityTableCoverage()

    const rollout = evaluateDistinguishabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.distinguishabilityStatusService.pingPostgres(),
      existingDistinguishabilityTableCount: distinguishabilityTableCoverage.existingDistinguishabilityTableCount,
      moderatorSynthesesTableExists: distinguishabilityTableCoverage.moderatorSynthesesTableExists,
      agentOutputsTableExists: distinguishabilityTableCoverage.agentOutputsTableExists,
      runWorkflowsTableExists: distinguishabilityTableCoverage.runWorkflowsTableExists,
    })

    return distinguishabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceDistinguishabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageDistinguishability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.distinguishabilityStatusService.getWorkspaceDistinguishabilityInventory(
        workspaceId,
      )
    const records = buildDistinguishabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.distinguishabilityStatusService.pingPostgres()
    const stats = buildDistinguishabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return distinguishabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveDistinguishabilityAdminActions(),
      guidance: getDistinguishabilityAdminGuidance({ stats }),
    })
  }

  async executeDistinguishabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_distinguishability_summary'
    },
  ) {
    this.assertCanManageDistinguishability(authContext)

    const payload = distinguishabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_distinguishability_summary': {
        const summary = await this.getWorkspaceDistinguishabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return distinguishabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed distinguishability summary with ${summary.stats.distinguishabilityPercent}% moderator synthesis distinguishability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageDistinguishability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production distinguishability tools.',
    })
  }
}
