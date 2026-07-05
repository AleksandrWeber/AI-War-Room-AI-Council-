import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getLexicalizabilityRolloutGuidance,
  lexicalizabilityAdminActionRequestSchema,
  lexicalizabilityAdminActionResponseSchema,
  lexicalizabilityAdminSummaryResponseSchema,
  lexicalizabilityCapabilitiesResponseSchema,
  lexicalizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildLexicalizabilityAdminRecords,
  buildLexicalizabilityAdminStats,
  getLexicalizabilityAdminGuidance,
  resolveLexicalizabilityAdminActions,
} from './lexicalizability-admin.helpers.js'
import { evaluateLexicalizabilityRollout } from './lexicalizability-rollout.helpers.js'
import { LexicalizabilityStatusService } from './lexicalizability-status.service.js'

@Injectable()
export class LexicalizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly lexicalizabilityStatusService: LexicalizabilityStatusService,
  ) {}

  getCapabilities() {
    return lexicalizabilityCapabilitiesResponseSchema.parse({
      supportsLexicalizabilityRollout: true,
      supportsLexicalizabilityAdminTools: true,
      supportsMembershipLexicalizabilitySignals: true,
      supportsUsageEventLexicalizabilitySignals: true,
      guidance: getLexicalizabilityRolloutGuidance(),
    })
  }

  async getLexicalizabilityRollout() {
    const lexicalizabilityTableCoverage =
      await this.lexicalizabilityStatusService.getLexicalizabilityTableCoverage()

    const rollout = evaluateLexicalizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.lexicalizabilityStatusService.pingPostgres(),
      existingLexicalizabilityTableCount: lexicalizabilityTableCoverage.existingLexicalizabilityTableCount,
      workspaceMembershipsTableExists: lexicalizabilityTableCoverage.workspaceMembershipsTableExists,
      usageEventsTableExists: lexicalizabilityTableCoverage.usageEventsTableExists,
      billingNotificationsTableExists: lexicalizabilityTableCoverage.billingNotificationsTableExists,
    })

    return lexicalizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceLexicalizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageLexicalizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.lexicalizabilityStatusService.getWorkspaceLexicalizabilityInventory(
        workspaceId,
      )
    const records = buildLexicalizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.lexicalizabilityStatusService.pingPostgres()
    const stats = buildLexicalizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return lexicalizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveLexicalizabilityAdminActions(),
      guidance: getLexicalizabilityAdminGuidance({ stats }),
    })
  }

  async executeLexicalizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_lexicalizability_summary'
    },
  ) {
    this.assertCanManageLexicalizability(authContext)

    const payload = lexicalizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_lexicalizability_summary': {
        const summary = await this.getWorkspaceLexicalizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return lexicalizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed lexicalizability summary with ${summary.stats.lexicalizabilityPercent}% membership lexicalizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageLexicalizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production lexicalizability tools.',
    })
  }
}
