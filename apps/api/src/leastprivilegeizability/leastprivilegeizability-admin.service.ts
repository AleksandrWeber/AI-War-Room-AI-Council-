import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getLeastprivilegeizabilityRolloutGuidance,
  leastprivilegeizabilityAdminActionRequestSchema,
  leastprivilegeizabilityAdminActionResponseSchema,
  leastprivilegeizabilityAdminSummaryResponseSchema,
  leastprivilegeizabilityCapabilitiesResponseSchema,
  leastprivilegeizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildLeastprivilegeizabilityAdminRecords,
  buildLeastprivilegeizabilityAdminStats,
  getLeastprivilegeizabilityAdminGuidance,
  resolveLeastprivilegeizabilityAdminActions,
} from './leastprivilegeizability-admin.helpers.js'
import { evaluateLeastprivilegeizabilityRollout } from './leastprivilegeizability-rollout.helpers.js'
import { LeastprivilegeizabilityStatusService } from './leastprivilegeizability-status.service.js'

@Injectable()
export class LeastprivilegeizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly leastprivilegeizabilityStatusService: LeastprivilegeizabilityStatusService,
  ) {}

  getCapabilities() {
    return leastprivilegeizabilityCapabilitiesResponseSchema.parse({
      supportsLeastprivilegeizabilityRollout: true,
      supportsLeastprivilegeizabilityAdminTools: true,
      supportsShieldScanLeastprivilegeizabilitySignals: true,
      supportsProviderCredentialLeastprivilegeizabilitySignals: true,
      guidance: getLeastprivilegeizabilityRolloutGuidance(),
    })
  }

  async getLeastprivilegeizabilityRollout() {
    const leastprivilegeizabilityTableCoverage =
      await this.leastprivilegeizabilityStatusService.getLeastprivilegeizabilityTableCoverage()

    const rollout = evaluateLeastprivilegeizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.leastprivilegeizabilityStatusService.pingPostgres(),
      existingLeastprivilegeizabilityTableCount: leastprivilegeizabilityTableCoverage.existingLeastprivilegeizabilityTableCount,
      shieldScansTableExists: leastprivilegeizabilityTableCoverage.shieldScansTableExists,
      workspaceProviderCredentialsTableExists: leastprivilegeizabilityTableCoverage.workspaceProviderCredentialsTableExists,
      billingWebhookEventsTableExists: leastprivilegeizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return leastprivilegeizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceLeastprivilegeizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageLeastprivilegeizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.leastprivilegeizabilityStatusService.getWorkspaceLeastprivilegeizabilityInventory(
        workspaceId,
      )
    const records = buildLeastprivilegeizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.leastprivilegeizabilityStatusService.pingPostgres()
    const stats = buildLeastprivilegeizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return leastprivilegeizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveLeastprivilegeizabilityAdminActions(),
      guidance: getLeastprivilegeizabilityAdminGuidance({ stats }),
    })
  }

  async executeLeastprivilegeizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_leastprivilegeizability_summary'
    },
  ) {
    this.assertCanManageLeastprivilegeizability(authContext)

    const payload = leastprivilegeizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_leastprivilegeizability_summary': {
        const summary = await this.getWorkspaceLeastprivilegeizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return leastprivilegeizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed leastprivilegeizability summary with ${summary.stats.leastprivilegeizabilityPercent}% shield scan leastprivilegeizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageLeastprivilegeizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production leastprivilegeizability tools.',
    })
  }
}
