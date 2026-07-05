import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getLegibilityRolloutGuidance,
  legibilityAdminActionRequestSchema,
  legibilityAdminActionResponseSchema,
  legibilityAdminSummaryResponseSchema,
  legibilityCapabilitiesResponseSchema,
  legibilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildLegibilityAdminRecords,
  buildLegibilityAdminStats,
  getLegibilityAdminGuidance,
  resolveLegibilityAdminActions,
} from './legibility-admin.helpers.js'
import { evaluateLegibilityRollout } from './legibility-rollout.helpers.js'
import { LegibilityStatusService } from './legibility-status.service.js'

@Injectable()
export class LegibilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly legibilityStatusService: LegibilityStatusService,
  ) {}

  getCapabilities() {
    return legibilityCapabilitiesResponseSchema.parse({
      supportsLegibilityRollout: true,
      supportsLegibilityAdminTools: true,
      supportsArtifactLegibilitySignals: true,
      supportsWorkflowLegibilitySignals: true,
      guidance: getLegibilityRolloutGuidance(),
    })
  }

  async getLegibilityRollout() {
    const legibilityTableCoverage =
      await this.legibilityStatusService.getLegibilityTableCoverage()

    const rollout = evaluateLegibilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.legibilityStatusService.pingPostgres(),
      existingLegibilityTableCount: legibilityTableCoverage.existingLegibilityTableCount,
      artifactsTableExists: legibilityTableCoverage.artifactsTableExists,
      runWorkflowsTableExists: legibilityTableCoverage.runWorkflowsTableExists,
      usageEventsTableExists: legibilityTableCoverage.usageEventsTableExists,
    })

    return legibilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceLegibilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageLegibility(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.legibilityStatusService.getWorkspaceLegibilityInventory(
        workspaceId,
      )
    const records = buildLegibilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.legibilityStatusService.pingPostgres()
    const stats = buildLegibilityAdminStats({
      records,
      postgresConnectivity,
    })

    return legibilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveLegibilityAdminActions(),
      guidance: getLegibilityAdminGuidance({ stats }),
    })
  }

  async executeLegibilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_legibility_summary'
    },
  ) {
    this.assertCanManageLegibility(authContext)

    const payload = legibilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_legibility_summary': {
        const summary = await this.getWorkspaceLegibilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return legibilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed legibility summary with ${summary.stats.legibilityPercent}% artifact legibility across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageLegibility(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production legibility tools.',
    })
  }
}
