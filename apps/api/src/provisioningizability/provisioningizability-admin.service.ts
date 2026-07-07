import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getProvisioningizabilityRolloutGuidance,
  provisioningizabilityAdminActionRequestSchema,
  provisioningizabilityAdminActionResponseSchema,
  provisioningizabilityAdminSummaryResponseSchema,
  provisioningizabilityCapabilitiesResponseSchema,
  provisioningizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildProvisioningizabilityAdminRecords,
  buildProvisioningizabilityAdminStats,
  getProvisioningizabilityAdminGuidance,
  resolveProvisioningizabilityAdminActions,
} from './provisioningizability-admin.helpers.js'
import { evaluateProvisioningizabilityRollout } from './provisioningizability-rollout.helpers.js'
import { ProvisioningizabilityStatusService } from './provisioningizability-status.service.js'

@Injectable()
export class ProvisioningizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly provisioningizabilityStatusService: ProvisioningizabilityStatusService,
  ) {}

  getCapabilities() {
    return provisioningizabilityCapabilitiesResponseSchema.parse({
      supportsProvisioningizabilityRollout: true,
      supportsProvisioningizabilityAdminTools: true,
      supportsWorkspaceLimitProvisioningizabilitySignals: true,
      supportsUsageEventProvisioningizabilitySignals: true,
      guidance: getProvisioningizabilityRolloutGuidance(),
    })
  }

  async getProvisioningizabilityRollout() {
    const provisioningizabilityTableCoverage =
      await this.provisioningizabilityStatusService.getProvisioningizabilityTableCoverage()

    const rollout = evaluateProvisioningizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.provisioningizabilityStatusService.pingPostgres(),
      existingProvisioningizabilityTableCount: provisioningizabilityTableCoverage.existingProvisioningizabilityTableCount,
      workspaceUsageLimitsTableExists: provisioningizabilityTableCoverage.workspaceUsageLimitsTableExists,
      usageEventsTableExists: provisioningizabilityTableCoverage.usageEventsTableExists,
      billingRecordsTableExists: provisioningizabilityTableCoverage.billingRecordsTableExists,
    })

    return provisioningizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceProvisioningizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageProvisioningizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.provisioningizabilityStatusService.getWorkspaceProvisioningizabilityInventory(
        workspaceId,
      )
    const records = buildProvisioningizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.provisioningizabilityStatusService.pingPostgres()
    const stats = buildProvisioningizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return provisioningizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveProvisioningizabilityAdminActions(),
      guidance: getProvisioningizabilityAdminGuidance({ stats }),
    })
  }

  async executeProvisioningizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_provisioningizability_summary'
    },
  ) {
    this.assertCanManageProvisioningizability(authContext)

    const payload = provisioningizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_provisioningizability_summary': {
        const summary = await this.getWorkspaceProvisioningizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return provisioningizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed provisioningizability summary with ${summary.stats.provisioningizabilityPercent}% workspace limit provisioningizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageProvisioningizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production provisioningizability tools.',
    })
  }
}
