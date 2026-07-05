import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getAuthenticityRolloutGuidance,
  authenticityAdminActionRequestSchema,
  authenticityAdminActionResponseSchema,
  authenticityAdminSummaryResponseSchema,
  authenticityCapabilitiesResponseSchema,
  authenticityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildAuthenticityAdminRecords,
  buildAuthenticityAdminStats,
  getAuthenticityAdminGuidance,
  resolveAuthenticityAdminActions,
} from './authenticity-admin.helpers.js'
import { evaluateAuthenticityRollout } from './authenticity-rollout.helpers.js'
import { AuthenticityStatusService } from './authenticity-status.service.js'

@Injectable()
export class AuthenticityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly authenticityStatusService: AuthenticityStatusService,
  ) {}

  getCapabilities() {
    return authenticityCapabilitiesResponseSchema.parse({
      supportsAuthenticityRollout: true,
      supportsAuthenticityAdminTools: true,
      supportsSynthesisAuthenticitySignals: true,
      supportsAgentOutputAuthenticitySignals: true,
      guidance: getAuthenticityRolloutGuidance(),
    })
  }

  async getAuthenticityRollout() {
    const authenticityTableCoverage =
      await this.authenticityStatusService.getAuthenticityTableCoverage()

    const rollout = evaluateAuthenticityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.authenticityStatusService.pingPostgres(),
      existingAuthenticityTableCount: authenticityTableCoverage.existingAuthenticityTableCount,
      moderatorSynthesesTableExists: authenticityTableCoverage.moderatorSynthesesTableExists,
      agentOutputsTableExists: authenticityTableCoverage.agentOutputsTableExists,
      artifactsTableExists: authenticityTableCoverage.artifactsTableExists,
    })

    return authenticityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceAuthenticityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageAuthenticity(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.authenticityStatusService.getWorkspaceAuthenticityInventory(
        workspaceId,
      )
    const records = buildAuthenticityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.authenticityStatusService.pingPostgres()
    const stats = buildAuthenticityAdminStats({
      records,
      postgresConnectivity,
    })

    return authenticityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveAuthenticityAdminActions(),
      guidance: getAuthenticityAdminGuidance({ stats }),
    })
  }

  async executeAuthenticityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_authenticity_summary'
    },
  ) {
    this.assertCanManageAuthenticity(authContext)

    const payload = authenticityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_authenticity_summary': {
        const summary = await this.getWorkspaceAuthenticityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return authenticityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed authenticity summary with ${summary.stats.authenticityPercent}% moderator synthesis authenticity across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageAuthenticity(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production authenticity tools.',
    })
  }
}
