import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getIntegrabilityRolloutGuidance,
  integrabilityAdminActionRequestSchema,
  integrabilityAdminActionResponseSchema,
  integrabilityAdminSummaryResponseSchema,
  integrabilityCapabilitiesResponseSchema,
  integrabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildIntegrabilityAdminRecords,
  buildIntegrabilityAdminStats,
  getIntegrabilityAdminGuidance,
  resolveIntegrabilityAdminActions,
} from './integrability-admin.helpers.js'
import { evaluateIntegrabilityRollout } from './integrability-rollout.helpers.js'
import { IntegrabilityStatusService } from './integrability-status.service.js'

@Injectable()
export class IntegrabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly integrabilityStatusService: IntegrabilityStatusService,
  ) {}

  getCapabilities() {
    return integrabilityCapabilitiesResponseSchema.parse({
      supportsIntegrabilityRollout: true,
      supportsIntegrabilityAdminTools: true,
      supportsBillingWebhookIntegrabilitySignals: true,
      supportsMeterUsageIntegrabilitySignals: true,
      guidance: getIntegrabilityRolloutGuidance(),
    })
  }

  async getIntegrabilityRollout() {
    const integrabilityTableCoverage =
      await this.integrabilityStatusService.getIntegrabilityTableCoverage()

    const rollout = evaluateIntegrabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.integrabilityStatusService.pingPostgres(),
      existingIntegrabilityTableCount: integrabilityTableCoverage.existingIntegrabilityTableCount,
      billingWebhookEventsTableExists: integrabilityTableCoverage.billingWebhookEventsTableExists,
      billingMeterUsageReportsTableExists: integrabilityTableCoverage.billingMeterUsageReportsTableExists,
      workspaceMembershipsTableExists: integrabilityTableCoverage.workspaceMembershipsTableExists,
    })

    return integrabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceIntegrabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageIntegrability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.integrabilityStatusService.getWorkspaceIntegrabilityInventory(
        workspaceId,
      )
    const records = buildIntegrabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.integrabilityStatusService.pingPostgres()
    const stats = buildIntegrabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return integrabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveIntegrabilityAdminActions(),
      guidance: getIntegrabilityAdminGuidance({ stats }),
    })
  }

  async executeIntegrabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_integrability_summary'
    },
  ) {
    this.assertCanManageIntegrability(authContext)

    const payload = integrabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_integrability_summary': {
        const summary = await this.getWorkspaceIntegrabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return integrabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed integrability summary with ${summary.stats.integrabilityPercent}% billing webhook integrability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageIntegrability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production integrability tools.',
    })
  }
}
