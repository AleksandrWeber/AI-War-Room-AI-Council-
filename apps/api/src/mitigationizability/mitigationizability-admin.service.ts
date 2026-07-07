import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getMitigationizabilityRolloutGuidance,
  mitigationizabilityAdminActionRequestSchema,
  mitigationizabilityAdminActionResponseSchema,
  mitigationizabilityAdminSummaryResponseSchema,
  mitigationizabilityCapabilitiesResponseSchema,
  mitigationizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildMitigationizabilityAdminRecords,
  buildMitigationizabilityAdminStats,
  getMitigationizabilityAdminGuidance,
  resolveMitigationizabilityAdminActions,
} from './mitigationizability-admin.helpers.js'
import { evaluateMitigationizabilityRollout } from './mitigationizability-rollout.helpers.js'
import { MitigationizabilityStatusService } from './mitigationizability-status.service.js'

@Injectable()
export class MitigationizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly mitigationizabilityStatusService: MitigationizabilityStatusService,
  ) {}

  getCapabilities() {
    return mitigationizabilityCapabilitiesResponseSchema.parse({
      supportsMitigationizabilityRollout: true,
      supportsMitigationizabilityAdminTools: true,
      supportsIdempotencyKeyMitigationizabilitySignals: true,
      supportsUsageEventMitigationizabilitySignals: true,
      guidance: getMitigationizabilityRolloutGuidance(),
    })
  }

  async getMitigationizabilityRollout() {
    const mitigationizabilityTableCoverage =
      await this.mitigationizabilityStatusService.getMitigationizabilityTableCoverage()

    const rollout = evaluateMitigationizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.mitigationizabilityStatusService.pingPostgres(),
      existingMitigationizabilityTableCount: mitigationizabilityTableCoverage.existingMitigationizabilityTableCount,
      idempotencyKeysTableExists: mitigationizabilityTableCoverage.idempotencyKeysTableExists,
      usageEventsTableExists: mitigationizabilityTableCoverage.usageEventsTableExists,
      billingWebhookEventsTableExists: mitigationizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return mitigationizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceMitigationizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageMitigationizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.mitigationizabilityStatusService.getWorkspaceMitigationizabilityInventory(
        workspaceId,
      )
    const records = buildMitigationizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.mitigationizabilityStatusService.pingPostgres()
    const stats = buildMitigationizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return mitigationizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveMitigationizabilityAdminActions(),
      guidance: getMitigationizabilityAdminGuidance({ stats }),
    })
  }

  async executeMitigationizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_mitigationizability_summary'
    },
  ) {
    this.assertCanManageMitigationizability(authContext)

    const payload = mitigationizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_mitigationizability_summary': {
        const summary = await this.getWorkspaceMitigationizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return mitigationizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed mitigationizability summary with ${summary.stats.mitigationizabilityPercent}% idempotency key mitigationizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageMitigationizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production mitigationizability tools.',
    })
  }
}
