import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getInductizabilityRolloutGuidance,
  inductizabilityAdminActionRequestSchema,
  inductizabilityAdminActionResponseSchema,
  inductizabilityAdminSummaryResponseSchema,
  inductizabilityCapabilitiesResponseSchema,
  inductizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildInductizabilityAdminRecords,
  buildInductizabilityAdminStats,
  getInductizabilityAdminGuidance,
  resolveInductizabilityAdminActions,
} from './inductizability-admin.helpers.js'
import { evaluateInductizabilityRollout } from './inductizability-rollout.helpers.js'
import { InductizabilityStatusService } from './inductizability-status.service.js'

@Injectable()
export class InductizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly inductizabilityStatusService: InductizabilityStatusService,
  ) {}

  getCapabilities() {
    return inductizabilityCapabilitiesResponseSchema.parse({
      supportsInductizabilityRollout: true,
      supportsInductizabilityAdminTools: true,
      supportsShieldScanInductizabilitySignals: true,
      supportsProviderCredentialInductizabilitySignals: true,
      guidance: getInductizabilityRolloutGuidance(),
    })
  }

  async getInductizabilityRollout() {
    const inductizabilityTableCoverage =
      await this.inductizabilityStatusService.getInductizabilityTableCoverage()

    const rollout = evaluateInductizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.inductizabilityStatusService.pingPostgres(),
      existingInductizabilityTableCount: inductizabilityTableCoverage.existingInductizabilityTableCount,
      shieldScansTableExists: inductizabilityTableCoverage.shieldScansTableExists,
      workspaceProviderCredentialsTableExists: inductizabilityTableCoverage.workspaceProviderCredentialsTableExists,
      billingWebhookEventsTableExists: inductizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return inductizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceInductizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageInductizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.inductizabilityStatusService.getWorkspaceInductizabilityInventory(
        workspaceId,
      )
    const records = buildInductizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.inductizabilityStatusService.pingPostgres()
    const stats = buildInductizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return inductizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveInductizabilityAdminActions(),
      guidance: getInductizabilityAdminGuidance({ stats }),
    })
  }

  async executeInductizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_inductizability_summary'
    },
  ) {
    this.assertCanManageInductizability(authContext)

    const payload = inductizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_inductizability_summary': {
        const summary = await this.getWorkspaceInductizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return inductizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed inductizability summary with ${summary.stats.inductizabilityPercent}% shield scan inductizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageInductizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production inductizability tools.',
    })
  }
}
