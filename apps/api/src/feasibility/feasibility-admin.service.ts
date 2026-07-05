import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getFeasibilityRolloutGuidance,
  feasibilityAdminActionRequestSchema,
  feasibilityAdminActionResponseSchema,
  feasibilityAdminSummaryResponseSchema,
  feasibilityCapabilitiesResponseSchema,
  feasibilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildFeasibilityAdminRecords,
  buildFeasibilityAdminStats,
  getFeasibilityAdminGuidance,
  resolveFeasibilityAdminActions,
} from './feasibility-admin.helpers.js'
import { evaluateFeasibilityRollout } from './feasibility-rollout.helpers.js'
import { FeasibilityStatusService } from './feasibility-status.service.js'

@Injectable()
export class FeasibilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly feasibilityStatusService: FeasibilityStatusService,
  ) {}

  getCapabilities() {
    return feasibilityCapabilitiesResponseSchema.parse({
      supportsFeasibilityRollout: true,
      supportsFeasibilityAdminTools: true,
      supportsProviderCredentialFeasibilitySignals: true,
      supportsUsageEventFeasibilitySignals: true,
      guidance: getFeasibilityRolloutGuidance(),
    })
  }

  async getFeasibilityRollout() {
    const feasibilityTableCoverage =
      await this.feasibilityStatusService.getFeasibilityTableCoverage()

    const rollout = evaluateFeasibilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.feasibilityStatusService.pingPostgres(),
      existingFeasibilityTableCount: feasibilityTableCoverage.existingFeasibilityTableCount,
      workspaceProviderCredentialsTableExists: feasibilityTableCoverage.workspaceProviderCredentialsTableExists,
      usageEventsTableExists: feasibilityTableCoverage.usageEventsTableExists,
      billingMeterUsageReportsTableExists: feasibilityTableCoverage.billingMeterUsageReportsTableExists,
    })

    return feasibilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceFeasibilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageFeasibility(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.feasibilityStatusService.getWorkspaceFeasibilityInventory(
        workspaceId,
      )
    const records = buildFeasibilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.feasibilityStatusService.pingPostgres()
    const stats = buildFeasibilityAdminStats({
      records,
      postgresConnectivity,
    })

    return feasibilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveFeasibilityAdminActions(),
      guidance: getFeasibilityAdminGuidance({ stats }),
    })
  }

  async executeFeasibilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_feasibility_summary'
    },
  ) {
    this.assertCanManageFeasibility(authContext)

    const payload = feasibilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_feasibility_summary': {
        const summary = await this.getWorkspaceFeasibilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return feasibilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed feasibility summary with ${summary.stats.feasibilityPercent}% provider credential feasibility across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageFeasibility(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production feasibility tools.',
    })
  }
}
