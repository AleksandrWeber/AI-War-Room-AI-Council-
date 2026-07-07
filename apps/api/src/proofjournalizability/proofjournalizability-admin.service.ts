import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getProofjournalizabilityRolloutGuidance,
  proofjournalizabilityAdminActionRequestSchema,
  proofjournalizabilityAdminActionResponseSchema,
  proofjournalizabilityAdminSummaryResponseSchema,
  proofjournalizabilityCapabilitiesResponseSchema,
  proofjournalizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildProofjournalizabilityAdminRecords,
  buildProofjournalizabilityAdminStats,
  getProofjournalizabilityAdminGuidance,
  resolveProofjournalizabilityAdminActions,
} from './proofjournalizability-admin.helpers.js'
import { evaluateProofjournalizabilityRollout } from './proofjournalizability-rollout.helpers.js'
import { ProofjournalizabilityStatusService } from './proofjournalizability-status.service.js'

@Injectable()
export class ProofjournalizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly proofjournalizabilityStatusService: ProofjournalizabilityStatusService,
  ) {}

  getCapabilities() {
    return proofjournalizabilityCapabilitiesResponseSchema.parse({
      supportsProofjournalizabilityRollout: true,
      supportsProofjournalizabilityAdminTools: true,
      supportsShieldScanProofjournalizabilitySignals: true,
      supportsProviderCredentialProofjournalizabilitySignals: true,
      guidance: getProofjournalizabilityRolloutGuidance(),
    })
  }

  async getProofjournalizabilityRollout() {
    const proofjournalizabilityTableCoverage =
      await this.proofjournalizabilityStatusService.getProofjournalizabilityTableCoverage()

    const rollout = evaluateProofjournalizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.proofjournalizabilityStatusService.pingPostgres(),
      existingProofjournalizabilityTableCount: proofjournalizabilityTableCoverage.existingProofjournalizabilityTableCount,
      shieldScansTableExists: proofjournalizabilityTableCoverage.shieldScansTableExists,
      workspaceProviderCredentialsTableExists: proofjournalizabilityTableCoverage.workspaceProviderCredentialsTableExists,
      billingWebhookEventsTableExists: proofjournalizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return proofjournalizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceProofjournalizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageProofjournalizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.proofjournalizabilityStatusService.getWorkspaceProofjournalizabilityInventory(
        workspaceId,
      )
    const records = buildProofjournalizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.proofjournalizabilityStatusService.pingPostgres()
    const stats = buildProofjournalizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return proofjournalizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveProofjournalizabilityAdminActions(),
      guidance: getProofjournalizabilityAdminGuidance({ stats }),
    })
  }

  async executeProofjournalizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_proofjournalizability_summary'
    },
  ) {
    this.assertCanManageProofjournalizability(authContext)

    const payload = proofjournalizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_proofjournalizability_summary': {
        const summary = await this.getWorkspaceProofjournalizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return proofjournalizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed proofjournalizability summary with ${summary.stats.proofjournalizabilityPercent}% shield scan proofjournalizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageProofjournalizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production proofjournalizability tools.',
    })
  }
}
