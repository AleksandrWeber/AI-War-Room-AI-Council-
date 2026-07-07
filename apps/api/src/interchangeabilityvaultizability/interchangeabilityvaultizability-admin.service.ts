import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getInterchangeabilityvaultizabilityRolloutGuidance,
  interchangeabilityvaultizabilityAdminActionRequestSchema,
  interchangeabilityvaultizabilityAdminActionResponseSchema,
  interchangeabilityvaultizabilityAdminSummaryResponseSchema,
  interchangeabilityvaultizabilityCapabilitiesResponseSchema,
  interchangeabilityvaultizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildInterchangeabilityvaultizabilityAdminRecords,
  buildInterchangeabilityvaultizabilityAdminStats,
  getInterchangeabilityvaultizabilityAdminGuidance,
  resolveInterchangeabilityvaultizabilityAdminActions,
} from './interchangeabilityvaultizability-admin.helpers.js'
import { evaluateInterchangeabilityvaultizabilityRollout } from './interchangeabilityvaultizability-rollout.helpers.js'
import { InterchangeabilityvaultizabilityStatusService } from './interchangeabilityvaultizability-status.service.js'

@Injectable()
export class InterchangeabilityvaultizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly interchangeabilityvaultizabilityStatusService: InterchangeabilityvaultizabilityStatusService,
  ) {}

  getCapabilities() {
    return interchangeabilityvaultizabilityCapabilitiesResponseSchema.parse({
      supportsInterchangeabilityvaultizabilityRollout: true,
      supportsInterchangeabilityvaultizabilityAdminTools: true,
      supportsIdempotencyKeyInterchangeabilityvaultizabilitySignals: true,
      supportsUsageEventInterchangeabilityvaultizabilitySignals: true,
      guidance: getInterchangeabilityvaultizabilityRolloutGuidance(),
    })
  }

  async getInterchangeabilityvaultizabilityRollout() {
    const interchangeabilityvaultizabilityTableCoverage =
      await this.interchangeabilityvaultizabilityStatusService.getInterchangeabilityvaultizabilityTableCoverage()

    const rollout = evaluateInterchangeabilityvaultizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.interchangeabilityvaultizabilityStatusService.pingPostgres(),
      existingInterchangeabilityvaultizabilityTableCount: interchangeabilityvaultizabilityTableCoverage.existingInterchangeabilityvaultizabilityTableCount,
      idempotencyKeysTableExists: interchangeabilityvaultizabilityTableCoverage.idempotencyKeysTableExists,
      usageEventsTableExists: interchangeabilityvaultizabilityTableCoverage.usageEventsTableExists,
      billingWebhookEventsTableExists: interchangeabilityvaultizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return interchangeabilityvaultizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceInterchangeabilityvaultizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageInterchangeabilityvaultizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.interchangeabilityvaultizabilityStatusService.getWorkspaceInterchangeabilityvaultizabilityInventory(
        workspaceId,
      )
    const records = buildInterchangeabilityvaultizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.interchangeabilityvaultizabilityStatusService.pingPostgres()
    const stats = buildInterchangeabilityvaultizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return interchangeabilityvaultizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveInterchangeabilityvaultizabilityAdminActions(),
      guidance: getInterchangeabilityvaultizabilityAdminGuidance({ stats }),
    })
  }

  async executeInterchangeabilityvaultizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_interchangeabilityvaultizability_summary'
    },
  ) {
    this.assertCanManageInterchangeabilityvaultizability(authContext)

    const payload = interchangeabilityvaultizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_interchangeabilityvaultizability_summary': {
        const summary = await this.getWorkspaceInterchangeabilityvaultizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return interchangeabilityvaultizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed interchangeabilityvaultizability summary with ${summary.stats.interchangeabilityvaultizabilityPercent}% idempotency key interchangeabilityvaultizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageInterchangeabilityvaultizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production interchangeabilityvaultizability tools.',
    })
  }
}
