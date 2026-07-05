import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getIntegrabilizabilityRolloutGuidance,
  integrabilizabilityAdminActionRequestSchema,
  integrabilizabilityAdminActionResponseSchema,
  integrabilizabilityAdminSummaryResponseSchema,
  integrabilizabilityCapabilitiesResponseSchema,
  integrabilizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildIntegrabilizabilityAdminRecords,
  buildIntegrabilizabilityAdminStats,
  getIntegrabilizabilityAdminGuidance,
  resolveIntegrabilizabilityAdminActions,
} from './integrabilizability-admin.helpers.js'
import { evaluateIntegrabilizabilityRollout } from './integrabilizability-rollout.helpers.js'
import { IntegrabilizabilityStatusService } from './integrabilizability-status.service.js'

@Injectable()
export class IntegrabilizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly integrabilizabilityStatusService: IntegrabilizabilityStatusService,
  ) {}

  getCapabilities() {
    return integrabilizabilityCapabilitiesResponseSchema.parse({
      supportsIntegrabilizabilityRollout: true,
      supportsIntegrabilizabilityAdminTools: true,
      supportsShieldScanIntegrabilizabilitySignals: true,
      supportsProviderCredentialIntegrabilizabilitySignals: true,
      guidance: getIntegrabilizabilityRolloutGuidance(),
    })
  }

  async getIntegrabilizabilityRollout() {
    const integrabilizabilityTableCoverage =
      await this.integrabilizabilityStatusService.getIntegrabilizabilityTableCoverage()

    const rollout = evaluateIntegrabilizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.integrabilizabilityStatusService.pingPostgres(),
      existingIntegrabilizabilityTableCount: integrabilizabilityTableCoverage.existingIntegrabilizabilityTableCount,
      shieldScansTableExists: integrabilizabilityTableCoverage.shieldScansTableExists,
      workspaceProviderCredentialsTableExists: integrabilizabilityTableCoverage.workspaceProviderCredentialsTableExists,
      billingWebhookEventsTableExists: integrabilizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return integrabilizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceIntegrabilizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageIntegrabilizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.integrabilizabilityStatusService.getWorkspaceIntegrabilizabilityInventory(
        workspaceId,
      )
    const records = buildIntegrabilizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.integrabilizabilityStatusService.pingPostgres()
    const stats = buildIntegrabilizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return integrabilizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveIntegrabilizabilityAdminActions(),
      guidance: getIntegrabilizabilityAdminGuidance({ stats }),
    })
  }

  async executeIntegrabilizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_integrabilizability_summary'
    },
  ) {
    this.assertCanManageIntegrabilizability(authContext)

    const payload = integrabilizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_integrabilizability_summary': {
        const summary = await this.getWorkspaceIntegrabilizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return integrabilizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed integrabilizability summary with ${summary.stats.integrabilizabilityPercent}% shield scan integrabilizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageIntegrabilizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production integrabilizability tools.',
    })
  }
}
