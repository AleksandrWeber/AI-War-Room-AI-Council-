import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getTokenizabilityRolloutGuidance,
  tokenizabilityAdminActionRequestSchema,
  tokenizabilityAdminActionResponseSchema,
  tokenizabilityAdminSummaryResponseSchema,
  tokenizabilityCapabilitiesResponseSchema,
  tokenizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildTokenizabilityAdminRecords,
  buildTokenizabilityAdminStats,
  getTokenizabilityAdminGuidance,
  resolveTokenizabilityAdminActions,
} from './tokenizability-admin.helpers.js'
import { evaluateTokenizabilityRollout } from './tokenizability-rollout.helpers.js'
import { TokenizabilityStatusService } from './tokenizability-status.service.js'

@Injectable()
export class TokenizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly tokenizabilityStatusService: TokenizabilityStatusService,
  ) {}

  getCapabilities() {
    return tokenizabilityCapabilitiesResponseSchema.parse({
      supportsTokenizabilityRollout: true,
      supportsTokenizabilityAdminTools: true,
      supportsMembershipTokenizabilitySignals: true,
      supportsUsageEventTokenizabilitySignals: true,
      guidance: getTokenizabilityRolloutGuidance(),
    })
  }

  async getTokenizabilityRollout() {
    const tokenizabilityTableCoverage =
      await this.tokenizabilityStatusService.getTokenizabilityTableCoverage()

    const rollout = evaluateTokenizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.tokenizabilityStatusService.pingPostgres(),
      existingTokenizabilityTableCount: tokenizabilityTableCoverage.existingTokenizabilityTableCount,
      workspaceMembershipsTableExists: tokenizabilityTableCoverage.workspaceMembershipsTableExists,
      usageEventsTableExists: tokenizabilityTableCoverage.usageEventsTableExists,
      billingNotificationsTableExists: tokenizabilityTableCoverage.billingNotificationsTableExists,
    })

    return tokenizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceTokenizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageTokenizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.tokenizabilityStatusService.getWorkspaceTokenizabilityInventory(
        workspaceId,
      )
    const records = buildTokenizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.tokenizabilityStatusService.pingPostgres()
    const stats = buildTokenizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return tokenizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveTokenizabilityAdminActions(),
      guidance: getTokenizabilityAdminGuidance({ stats }),
    })
  }

  async executeTokenizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_tokenizability_summary'
    },
  ) {
    this.assertCanManageTokenizability(authContext)

    const payload = tokenizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_tokenizability_summary': {
        const summary = await this.getWorkspaceTokenizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return tokenizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed tokenizability summary with ${summary.stats.tokenizabilityPercent}% membership tokenizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageTokenizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production tokenizability tools.',
    })
  }
}
