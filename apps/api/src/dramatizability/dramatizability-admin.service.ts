import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getDramatizabilityRolloutGuidance,
  dramatizabilityAdminActionRequestSchema,
  dramatizabilityAdminActionResponseSchema,
  dramatizabilityAdminSummaryResponseSchema,
  dramatizabilityCapabilitiesResponseSchema,
  dramatizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildDramatizabilityAdminRecords,
  buildDramatizabilityAdminStats,
  getDramatizabilityAdminGuidance,
  resolveDramatizabilityAdminActions,
} from './dramatizability-admin.helpers.js'
import { evaluateDramatizabilityRollout } from './dramatizability-rollout.helpers.js'
import { DramatizabilityStatusService } from './dramatizability-status.service.js'

@Injectable()
export class DramatizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly dramatizabilityStatusService: DramatizabilityStatusService,
  ) {}

  getCapabilities() {
    return dramatizabilityCapabilitiesResponseSchema.parse({
      supportsDramatizabilityRollout: true,
      supportsDramatizabilityAdminTools: true,
      supportsArtifactDramatizabilitySignals: true,
      supportsAgentOutputDramatizabilitySignals: true,
      guidance: getDramatizabilityRolloutGuidance(),
    })
  }

  async getDramatizabilityRollout() {
    const dramatizabilityTableCoverage =
      await this.dramatizabilityStatusService.getDramatizabilityTableCoverage()

    const rollout = evaluateDramatizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.dramatizabilityStatusService.pingPostgres(),
      existingDramatizabilityTableCount: dramatizabilityTableCoverage.existingDramatizabilityTableCount,
      artifactsTableExists: dramatizabilityTableCoverage.artifactsTableExists,
      agentOutputsTableExists: dramatizabilityTableCoverage.agentOutputsTableExists,
      moderatorSynthesesTableExists: dramatizabilityTableCoverage.moderatorSynthesesTableExists,
    })

    return dramatizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceDramatizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageDramatizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.dramatizabilityStatusService.getWorkspaceDramatizabilityInventory(
        workspaceId,
      )
    const records = buildDramatizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.dramatizabilityStatusService.pingPostgres()
    const stats = buildDramatizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return dramatizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveDramatizabilityAdminActions(),
      guidance: getDramatizabilityAdminGuidance({ stats }),
    })
  }

  async executeDramatizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_dramatizability_summary'
    },
  ) {
    this.assertCanManageDramatizability(authContext)

    const payload = dramatizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_dramatizability_summary': {
        const summary = await this.getWorkspaceDramatizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return dramatizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed dramatizability summary with ${summary.stats.dramatizabilityPercent}% artifact dramatizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageDramatizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production dramatizability tools.',
    })
  }
}
