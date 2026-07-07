import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getEvidencizabilityRolloutGuidance,
  evidencizabilityAdminActionRequestSchema,
  evidencizabilityAdminActionResponseSchema,
  evidencizabilityAdminSummaryResponseSchema,
  evidencizabilityCapabilitiesResponseSchema,
  evidencizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildEvidencizabilityAdminRecords,
  buildEvidencizabilityAdminStats,
  getEvidencizabilityAdminGuidance,
  resolveEvidencizabilityAdminActions,
} from './evidencizability-admin.helpers.js'
import { evaluateEvidencizabilityRollout } from './evidencizability-rollout.helpers.js'
import { EvidencizabilityStatusService } from './evidencizability-status.service.js'

@Injectable()
export class EvidencizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly evidencizabilityStatusService: EvidencizabilityStatusService,
  ) {}

  getCapabilities() {
    return evidencizabilityCapabilitiesResponseSchema.parse({
      supportsEvidencizabilityRollout: true,
      supportsEvidencizabilityAdminTools: true,
      supportsIdempotencyKeyEvidencizabilitySignals: true,
      supportsUsageEventEvidencizabilitySignals: true,
      guidance: getEvidencizabilityRolloutGuidance(),
    })
  }

  async getEvidencizabilityRollout() {
    const evidencizabilityTableCoverage =
      await this.evidencizabilityStatusService.getEvidencizabilityTableCoverage()

    const rollout = evaluateEvidencizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.evidencizabilityStatusService.pingPostgres(),
      existingEvidencizabilityTableCount: evidencizabilityTableCoverage.existingEvidencizabilityTableCount,
      idempotencyKeysTableExists: evidencizabilityTableCoverage.idempotencyKeysTableExists,
      usageEventsTableExists: evidencizabilityTableCoverage.usageEventsTableExists,
      billingWebhookEventsTableExists: evidencizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return evidencizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceEvidencizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageEvidencizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.evidencizabilityStatusService.getWorkspaceEvidencizabilityInventory(
        workspaceId,
      )
    const records = buildEvidencizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.evidencizabilityStatusService.pingPostgres()
    const stats = buildEvidencizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return evidencizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveEvidencizabilityAdminActions(),
      guidance: getEvidencizabilityAdminGuidance({ stats }),
    })
  }

  async executeEvidencizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_evidencizability_summary'
    },
  ) {
    this.assertCanManageEvidencizability(authContext)

    const payload = evidencizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_evidencizability_summary': {
        const summary = await this.getWorkspaceEvidencizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return evidencizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed evidencizability summary with ${summary.stats.evidencizabilityPercent}% idempotency key evidencizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageEvidencizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production evidencizability tools.',
    })
  }
}
