import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getSurvivabilityRolloutGuidance,
  survivabilityAdminActionRequestSchema,
  survivabilityAdminActionResponseSchema,
  survivabilityAdminSummaryResponseSchema,
  survivabilityCapabilitiesResponseSchema,
  survivabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildSurvivabilityAdminRecords,
  buildSurvivabilityAdminStats,
  getSurvivabilityAdminGuidance,
  resolveSurvivabilityAdminActions,
} from './survivability-admin.helpers.js'
import { evaluateSurvivabilityRollout } from './survivability-rollout.helpers.js'
import { SurvivabilityStatusService } from './survivability-status.service.js'

@Injectable()
export class SurvivabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly survivabilityStatusService: SurvivabilityStatusService,
  ) {}

  getCapabilities() {
    return survivabilityCapabilitiesResponseSchema.parse({
      supportsSurvivabilityRollout: true,
      supportsSurvivabilityAdminTools: true,
      supportsBillingRecordSurvivabilitySignals: true,
      supportsMeterUsageSurvivabilitySignals: true,
      guidance: getSurvivabilityRolloutGuidance(),
    })
  }

  async getSurvivabilityRollout() {
    const survivabilityTableCoverage =
      await this.survivabilityStatusService.getSurvivabilityTableCoverage()

    const rollout = evaluateSurvivabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.survivabilityStatusService.pingPostgres(),
      existingSurvivabilityTableCount: survivabilityTableCoverage.existingSurvivabilityTableCount,
      billingRecordsTableExists: survivabilityTableCoverage.billingRecordsTableExists,
      billingMeterUsageReportsTableExists: survivabilityTableCoverage.billingMeterUsageReportsTableExists,
      workspaceUsageLimitsTableExists: survivabilityTableCoverage.workspaceUsageLimitsTableExists,
    })

    return survivabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceSurvivabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageSurvivability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.survivabilityStatusService.getWorkspaceSurvivabilityInventory(
        workspaceId,
      )
    const records = buildSurvivabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.survivabilityStatusService.pingPostgres()
    const stats = buildSurvivabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return survivabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveSurvivabilityAdminActions(),
      guidance: getSurvivabilityAdminGuidance({ stats }),
    })
  }

  async executeSurvivabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_survivability_summary'
    },
  ) {
    this.assertCanManageSurvivability(authContext)

    const payload = survivabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_survivability_summary': {
        const summary = await this.getWorkspaceSurvivabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return survivabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed survivability summary with ${summary.stats.survivabilityPercent}% billing record survivability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageSurvivability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production survivability tools.',
    })
  }
}
