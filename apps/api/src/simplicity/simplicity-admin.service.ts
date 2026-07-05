import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getSimplicityRolloutGuidance,
  simplicityAdminActionRequestSchema,
  simplicityAdminActionResponseSchema,
  simplicityAdminSummaryResponseSchema,
  simplicityCapabilitiesResponseSchema,
  simplicityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildSimplicityAdminRecords,
  buildSimplicityAdminStats,
  getSimplicityAdminGuidance,
  resolveSimplicityAdminActions,
} from './simplicity-admin.helpers.js'
import { evaluateSimplicityRollout } from './simplicity-rollout.helpers.js'
import { SimplicityStatusService } from './simplicity-status.service.js'

@Injectable()
export class SimplicityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly simplicityStatusService: SimplicityStatusService,
  ) {}

  getCapabilities() {
    return simplicityCapabilitiesResponseSchema.parse({
      supportsSimplicityRollout: true,
      supportsSimplicityAdminTools: true,
      supportsWorkflowSimplicitySignals: true,
      supportsIdempotencyKeySimplicitySignals: true,
      guidance: getSimplicityRolloutGuidance(),
    })
  }

  async getSimplicityRollout() {
    const simplicityTableCoverage =
      await this.simplicityStatusService.getSimplicityTableCoverage()

    const rollout = evaluateSimplicityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.simplicityStatusService.pingPostgres(),
      existingSimplicityTableCount: simplicityTableCoverage.existingSimplicityTableCount,
      runWorkflowsTableExists: simplicityTableCoverage.runWorkflowsTableExists,
      idempotencyKeysTableExists: simplicityTableCoverage.idempotencyKeysTableExists,
      usageEventsTableExists: simplicityTableCoverage.usageEventsTableExists,
    })

    return simplicityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceSimplicityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageSimplicity(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.simplicityStatusService.getWorkspaceSimplicityInventory(
        workspaceId,
      )
    const records = buildSimplicityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.simplicityStatusService.pingPostgres()
    const stats = buildSimplicityAdminStats({
      records,
      postgresConnectivity,
    })

    return simplicityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveSimplicityAdminActions(),
      guidance: getSimplicityAdminGuidance({ stats }),
    })
  }

  async executeSimplicityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_simplicity_summary'
    },
  ) {
    this.assertCanManageSimplicity(authContext)

    const payload = simplicityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_simplicity_summary': {
        const summary = await this.getWorkspaceSimplicityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return simplicityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed simplicity summary with ${summary.stats.simplicityPercent}% workflow simplicity across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageSimplicity(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production simplicity tools.',
    })
  }
}
