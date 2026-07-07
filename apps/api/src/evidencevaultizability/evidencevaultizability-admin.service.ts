import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getEvidencevaultizabilityRolloutGuidance,
  evidencevaultizabilityAdminActionRequestSchema,
  evidencevaultizabilityAdminActionResponseSchema,
  evidencevaultizabilityAdminSummaryResponseSchema,
  evidencevaultizabilityCapabilitiesResponseSchema,
  evidencevaultizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildEvidencevaultizabilityAdminRecords,
  buildEvidencevaultizabilityAdminStats,
  getEvidencevaultizabilityAdminGuidance,
  resolveEvidencevaultizabilityAdminActions,
} from './evidencevaultizability-admin.helpers.js'
import { evaluateEvidencevaultizabilityRollout } from './evidencevaultizability-rollout.helpers.js'
import { EvidencevaultizabilityStatusService } from './evidencevaultizability-status.service.js'

@Injectable()
export class EvidencevaultizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly evidencevaultizabilityStatusService: EvidencevaultizabilityStatusService,
  ) {}

  getCapabilities() {
    return evidencevaultizabilityCapabilitiesResponseSchema.parse({
      supportsEvidencevaultizabilityRollout: true,
      supportsEvidencevaultizabilityAdminTools: true,
      supportsIdempotencyKeyEvidencevaultizabilitySignals: true,
      supportsUsageEventEvidencevaultizabilitySignals: true,
      guidance: getEvidencevaultizabilityRolloutGuidance(),
    })
  }

  async getEvidencevaultizabilityRollout() {
    const evidencevaultizabilityTableCoverage =
      await this.evidencevaultizabilityStatusService.getEvidencevaultizabilityTableCoverage()

    const rollout = evaluateEvidencevaultizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.evidencevaultizabilityStatusService.pingPostgres(),
      existingEvidencevaultizabilityTableCount: evidencevaultizabilityTableCoverage.existingEvidencevaultizabilityTableCount,
      idempotencyKeysTableExists: evidencevaultizabilityTableCoverage.idempotencyKeysTableExists,
      usageEventsTableExists: evidencevaultizabilityTableCoverage.usageEventsTableExists,
      billingWebhookEventsTableExists: evidencevaultizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return evidencevaultizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceEvidencevaultizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageEvidencevaultizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.evidencevaultizabilityStatusService.getWorkspaceEvidencevaultizabilityInventory(
        workspaceId,
      )
    const records = buildEvidencevaultizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.evidencevaultizabilityStatusService.pingPostgres()
    const stats = buildEvidencevaultizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return evidencevaultizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveEvidencevaultizabilityAdminActions(),
      guidance: getEvidencevaultizabilityAdminGuidance({ stats }),
    })
  }

  async executeEvidencevaultizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_evidencevaultizability_summary'
    },
  ) {
    this.assertCanManageEvidencevaultizability(authContext)

    const payload = evidencevaultizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_evidencevaultizability_summary': {
        const summary = await this.getWorkspaceEvidencevaultizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return evidencevaultizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed evidencevaultizability summary with ${summary.stats.evidencevaultizabilityPercent}% idempotency key evidencevaultizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageEvidencevaultizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production evidencevaultizability tools.',
    })
  }
}
