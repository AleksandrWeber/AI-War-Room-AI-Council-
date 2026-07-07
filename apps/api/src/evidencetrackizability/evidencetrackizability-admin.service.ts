import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getEvidencetrackizabilityRolloutGuidance,
  evidencetrackizabilityAdminActionRequestSchema,
  evidencetrackizabilityAdminActionResponseSchema,
  evidencetrackizabilityAdminSummaryResponseSchema,
  evidencetrackizabilityCapabilitiesResponseSchema,
  evidencetrackizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildEvidencetrackizabilityAdminRecords,
  buildEvidencetrackizabilityAdminStats,
  getEvidencetrackizabilityAdminGuidance,
  resolveEvidencetrackizabilityAdminActions,
} from './evidencetrackizability-admin.helpers.js'
import { evaluateEvidencetrackizabilityRollout } from './evidencetrackizability-rollout.helpers.js'
import { EvidencetrackizabilityStatusService } from './evidencetrackizability-status.service.js'

@Injectable()
export class EvidencetrackizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly evidencetrackizabilityStatusService: EvidencetrackizabilityStatusService,
  ) {}

  getCapabilities() {
    return evidencetrackizabilityCapabilitiesResponseSchema.parse({
      supportsEvidencetrackizabilityRollout: true,
      supportsEvidencetrackizabilityAdminTools: true,
      supportsIdempotencyKeyEvidencetrackizabilitySignals: true,
      supportsUsageEventEvidencetrackizabilitySignals: true,
      guidance: getEvidencetrackizabilityRolloutGuidance(),
    })
  }

  async getEvidencetrackizabilityRollout() {
    const evidencetrackizabilityTableCoverage =
      await this.evidencetrackizabilityStatusService.getEvidencetrackizabilityTableCoverage()

    const rollout = evaluateEvidencetrackizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.evidencetrackizabilityStatusService.pingPostgres(),
      existingEvidencetrackizabilityTableCount: evidencetrackizabilityTableCoverage.existingEvidencetrackizabilityTableCount,
      idempotencyKeysTableExists: evidencetrackizabilityTableCoverage.idempotencyKeysTableExists,
      usageEventsTableExists: evidencetrackizabilityTableCoverage.usageEventsTableExists,
      billingWebhookEventsTableExists: evidencetrackizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return evidencetrackizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceEvidencetrackizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageEvidencetrackizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.evidencetrackizabilityStatusService.getWorkspaceEvidencetrackizabilityInventory(
        workspaceId,
      )
    const records = buildEvidencetrackizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.evidencetrackizabilityStatusService.pingPostgres()
    const stats = buildEvidencetrackizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return evidencetrackizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveEvidencetrackizabilityAdminActions(),
      guidance: getEvidencetrackizabilityAdminGuidance({ stats }),
    })
  }

  async executeEvidencetrackizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_evidencetrackizability_summary'
    },
  ) {
    this.assertCanManageEvidencetrackizability(authContext)

    const payload = evidencetrackizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_evidencetrackizability_summary': {
        const summary = await this.getWorkspaceEvidencetrackizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return evidencetrackizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed evidencetrackizability summary with ${summary.stats.evidencetrackizabilityPercent}% idempotency key evidencetrackizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageEvidencetrackizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production evidencetrackizability tools.',
    })
  }
}
