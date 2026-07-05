import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getConcretizabilityRolloutGuidance,
  concretizabilityAdminActionRequestSchema,
  concretizabilityAdminActionResponseSchema,
  concretizabilityAdminSummaryResponseSchema,
  concretizabilityCapabilitiesResponseSchema,
  concretizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildConcretizabilityAdminRecords,
  buildConcretizabilityAdminStats,
  getConcretizabilityAdminGuidance,
  resolveConcretizabilityAdminActions,
} from './concretizability-admin.helpers.js'
import { evaluateConcretizabilityRollout } from './concretizability-rollout.helpers.js'
import { ConcretizabilityStatusService } from './concretizability-status.service.js'

@Injectable()
export class ConcretizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly concretizabilityStatusService: ConcretizabilityStatusService,
  ) {}

  getCapabilities() {
    return concretizabilityCapabilitiesResponseSchema.parse({
      supportsConcretizabilityRollout: true,
      supportsConcretizabilityAdminTools: true,
      supportsIdempotencyKeyConcretizabilitySignals: true,
      supportsUsageEventConcretizabilitySignals: true,
      guidance: getConcretizabilityRolloutGuidance(),
    })
  }

  async getConcretizabilityRollout() {
    const concretizabilityTableCoverage =
      await this.concretizabilityStatusService.getConcretizabilityTableCoverage()

    const rollout = evaluateConcretizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.concretizabilityStatusService.pingPostgres(),
      existingConcretizabilityTableCount: concretizabilityTableCoverage.existingConcretizabilityTableCount,
      idempotencyKeysTableExists: concretizabilityTableCoverage.idempotencyKeysTableExists,
      usageEventsTableExists: concretizabilityTableCoverage.usageEventsTableExists,
      billingWebhookEventsTableExists: concretizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return concretizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceConcretizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageConcretizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.concretizabilityStatusService.getWorkspaceConcretizabilityInventory(
        workspaceId,
      )
    const records = buildConcretizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.concretizabilityStatusService.pingPostgres()
    const stats = buildConcretizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return concretizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveConcretizabilityAdminActions(),
      guidance: getConcretizabilityAdminGuidance({ stats }),
    })
  }

  async executeConcretizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_concretizability_summary'
    },
  ) {
    this.assertCanManageConcretizability(authContext)

    const payload = concretizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_concretizability_summary': {
        const summary = await this.getWorkspaceConcretizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return concretizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed concretizability summary with ${summary.stats.concretizabilityPercent}% idempotency key concretizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageConcretizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production concretizability tools.',
    })
  }
}
