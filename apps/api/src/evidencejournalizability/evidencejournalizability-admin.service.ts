import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getEvidencejournalizabilityRolloutGuidance,
  evidencejournalizabilityAdminActionRequestSchema,
  evidencejournalizabilityAdminActionResponseSchema,
  evidencejournalizabilityAdminSummaryResponseSchema,
  evidencejournalizabilityCapabilitiesResponseSchema,
  evidencejournalizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildEvidencejournalizabilityAdminRecords,
  buildEvidencejournalizabilityAdminStats,
  getEvidencejournalizabilityAdminGuidance,
  resolveEvidencejournalizabilityAdminActions,
} from './evidencejournalizability-admin.helpers.js'
import { evaluateEvidencejournalizabilityRollout } from './evidencejournalizability-rollout.helpers.js'
import { EvidencejournalizabilityStatusService } from './evidencejournalizability-status.service.js'

@Injectable()
export class EvidencejournalizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly evidencejournalizabilityStatusService: EvidencejournalizabilityStatusService,
  ) {}

  getCapabilities() {
    return evidencejournalizabilityCapabilitiesResponseSchema.parse({
      supportsEvidencejournalizabilityRollout: true,
      supportsEvidencejournalizabilityAdminTools: true,
      supportsIdempotencyKeyEvidencejournalizabilitySignals: true,
      supportsUsageEventEvidencejournalizabilitySignals: true,
      guidance: getEvidencejournalizabilityRolloutGuidance(),
    })
  }

  async getEvidencejournalizabilityRollout() {
    const evidencejournalizabilityTableCoverage =
      await this.evidencejournalizabilityStatusService.getEvidencejournalizabilityTableCoverage()

    const rollout = evaluateEvidencejournalizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.evidencejournalizabilityStatusService.pingPostgres(),
      existingEvidencejournalizabilityTableCount: evidencejournalizabilityTableCoverage.existingEvidencejournalizabilityTableCount,
      idempotencyKeysTableExists: evidencejournalizabilityTableCoverage.idempotencyKeysTableExists,
      usageEventsTableExists: evidencejournalizabilityTableCoverage.usageEventsTableExists,
      billingWebhookEventsTableExists: evidencejournalizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return evidencejournalizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceEvidencejournalizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageEvidencejournalizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.evidencejournalizabilityStatusService.getWorkspaceEvidencejournalizabilityInventory(
        workspaceId,
      )
    const records = buildEvidencejournalizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.evidencejournalizabilityStatusService.pingPostgres()
    const stats = buildEvidencejournalizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return evidencejournalizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveEvidencejournalizabilityAdminActions(),
      guidance: getEvidencejournalizabilityAdminGuidance({ stats }),
    })
  }

  async executeEvidencejournalizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_evidencejournalizability_summary'
    },
  ) {
    this.assertCanManageEvidencejournalizability(authContext)

    const payload = evidencejournalizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_evidencejournalizability_summary': {
        const summary = await this.getWorkspaceEvidencejournalizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return evidencejournalizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed evidencejournalizability summary with ${summary.stats.evidencejournalizabilityPercent}% idempotency key evidencejournalizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageEvidencejournalizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production evidencejournalizability tools.',
    })
  }
}
