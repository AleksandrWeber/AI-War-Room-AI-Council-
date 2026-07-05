import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getReferencizabilityRolloutGuidance,
  referencizabilityAdminActionRequestSchema,
  referencizabilityAdminActionResponseSchema,
  referencizabilityAdminSummaryResponseSchema,
  referencizabilityCapabilitiesResponseSchema,
  referencizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildReferencizabilityAdminRecords,
  buildReferencizabilityAdminStats,
  getReferencizabilityAdminGuidance,
  resolveReferencizabilityAdminActions,
} from './referencizability-admin.helpers.js'
import { evaluateReferencizabilityRollout } from './referencizability-rollout.helpers.js'
import { ReferencizabilityStatusService } from './referencizability-status.service.js'

@Injectable()
export class ReferencizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly referencizabilityStatusService: ReferencizabilityStatusService,
  ) {}

  getCapabilities() {
    return referencizabilityCapabilitiesResponseSchema.parse({
      supportsReferencizabilityRollout: true,
      supportsReferencizabilityAdminTools: true,
      supportsIdempotencyKeyReferencizabilitySignals: true,
      supportsUsageEventReferencizabilitySignals: true,
      guidance: getReferencizabilityRolloutGuidance(),
    })
  }

  async getReferencizabilityRollout() {
    const referencizabilityTableCoverage =
      await this.referencizabilityStatusService.getReferencizabilityTableCoverage()

    const rollout = evaluateReferencizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.referencizabilityStatusService.pingPostgres(),
      existingReferencizabilityTableCount: referencizabilityTableCoverage.existingReferencizabilityTableCount,
      idempotencyKeysTableExists: referencizabilityTableCoverage.idempotencyKeysTableExists,
      usageEventsTableExists: referencizabilityTableCoverage.usageEventsTableExists,
      billingWebhookEventsTableExists: referencizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return referencizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceReferencizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageReferencizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.referencizabilityStatusService.getWorkspaceReferencizabilityInventory(
        workspaceId,
      )
    const records = buildReferencizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.referencizabilityStatusService.pingPostgres()
    const stats = buildReferencizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return referencizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveReferencizabilityAdminActions(),
      guidance: getReferencizabilityAdminGuidance({ stats }),
    })
  }

  async executeReferencizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_referencizability_summary'
    },
  ) {
    this.assertCanManageReferencizability(authContext)

    const payload = referencizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_referencizability_summary': {
        const summary = await this.getWorkspaceReferencizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return referencizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed referencizability summary with ${summary.stats.referencizabilityPercent}% idempotency key referencizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageReferencizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production referencizability tools.',
    })
  }
}
