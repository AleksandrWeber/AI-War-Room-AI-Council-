import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getHermeneutizabilityRolloutGuidance,
  hermeneutizabilityAdminActionRequestSchema,
  hermeneutizabilityAdminActionResponseSchema,
  hermeneutizabilityAdminSummaryResponseSchema,
  hermeneutizabilityCapabilitiesResponseSchema,
  hermeneutizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildHermeneutizabilityAdminRecords,
  buildHermeneutizabilityAdminStats,
  getHermeneutizabilityAdminGuidance,
  resolveHermeneutizabilityAdminActions,
} from './hermeneutizability-admin.helpers.js'
import { evaluateHermeneutizabilityRollout } from './hermeneutizability-rollout.helpers.js'
import { HermeneutizabilityStatusService } from './hermeneutizability-status.service.js'

@Injectable()
export class HermeneutizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly hermeneutizabilityStatusService: HermeneutizabilityStatusService,
  ) {}

  getCapabilities() {
    return hermeneutizabilityCapabilitiesResponseSchema.parse({
      supportsHermeneutizabilityRollout: true,
      supportsHermeneutizabilityAdminTools: true,
      supportsIdempotencyKeyHermeneutizabilitySignals: true,
      supportsUsageEventHermeneutizabilitySignals: true,
      guidance: getHermeneutizabilityRolloutGuidance(),
    })
  }

  async getHermeneutizabilityRollout() {
    const hermeneutizabilityTableCoverage =
      await this.hermeneutizabilityStatusService.getHermeneutizabilityTableCoverage()

    const rollout = evaluateHermeneutizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.hermeneutizabilityStatusService.pingPostgres(),
      existingHermeneutizabilityTableCount: hermeneutizabilityTableCoverage.existingHermeneutizabilityTableCount,
      idempotencyKeysTableExists: hermeneutizabilityTableCoverage.idempotencyKeysTableExists,
      usageEventsTableExists: hermeneutizabilityTableCoverage.usageEventsTableExists,
      billingWebhookEventsTableExists: hermeneutizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return hermeneutizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceHermeneutizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageHermeneutizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.hermeneutizabilityStatusService.getWorkspaceHermeneutizabilityInventory(
        workspaceId,
      )
    const records = buildHermeneutizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.hermeneutizabilityStatusService.pingPostgres()
    const stats = buildHermeneutizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return hermeneutizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveHermeneutizabilityAdminActions(),
      guidance: getHermeneutizabilityAdminGuidance({ stats }),
    })
  }

  async executeHermeneutizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_hermeneutizability_summary'
    },
  ) {
    this.assertCanManageHermeneutizability(authContext)

    const payload = hermeneutizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_hermeneutizability_summary': {
        const summary = await this.getWorkspaceHermeneutizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return hermeneutizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed hermeneutizability summary with ${summary.stats.hermeneutizabilityPercent}% idempotency key hermeneutizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageHermeneutizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production hermeneutizability tools.',
    })
  }
}
