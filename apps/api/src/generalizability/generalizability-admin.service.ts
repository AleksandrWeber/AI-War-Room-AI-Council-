import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getGeneralizabilityRolloutGuidance,
  generalizabilityAdminActionRequestSchema,
  generalizabilityAdminActionResponseSchema,
  generalizabilityAdminSummaryResponseSchema,
  generalizabilityCapabilitiesResponseSchema,
  generalizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildGeneralizabilityAdminRecords,
  buildGeneralizabilityAdminStats,
  getGeneralizabilityAdminGuidance,
  resolveGeneralizabilityAdminActions,
} from './generalizability-admin.helpers.js'
import { evaluateGeneralizabilityRollout } from './generalizability-rollout.helpers.js'
import { GeneralizabilityStatusService } from './generalizability-status.service.js'

@Injectable()
export class GeneralizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly generalizabilityStatusService: GeneralizabilityStatusService,
  ) {}

  getCapabilities() {
    return generalizabilityCapabilitiesResponseSchema.parse({
      supportsGeneralizabilityRollout: true,
      supportsGeneralizabilityAdminTools: true,
      supportsMeterUsageGeneralizabilitySignals: true,
      supportsUsageEventGeneralizabilitySignals: true,
      guidance: getGeneralizabilityRolloutGuidance(),
    })
  }

  async getGeneralizabilityRollout() {
    const generalizabilityTableCoverage =
      await this.generalizabilityStatusService.getGeneralizabilityTableCoverage()

    const rollout = evaluateGeneralizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.generalizabilityStatusService.pingPostgres(),
      existingGeneralizabilityTableCount: generalizabilityTableCoverage.existingGeneralizabilityTableCount,
      billingMeterUsageReportsTableExists: generalizabilityTableCoverage.billingMeterUsageReportsTableExists,
      usageEventsTableExists: generalizabilityTableCoverage.usageEventsTableExists,
      workspaceUsageLimitsTableExists: generalizabilityTableCoverage.workspaceUsageLimitsTableExists,
    })

    return generalizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceGeneralizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageGeneralizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.generalizabilityStatusService.getWorkspaceGeneralizabilityInventory(
        workspaceId,
      )
    const records = buildGeneralizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.generalizabilityStatusService.pingPostgres()
    const stats = buildGeneralizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return generalizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveGeneralizabilityAdminActions(),
      guidance: getGeneralizabilityAdminGuidance({ stats }),
    })
  }

  async executeGeneralizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_generalizability_summary'
    },
  ) {
    this.assertCanManageGeneralizability(authContext)

    const payload = generalizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_generalizability_summary': {
        const summary = await this.getWorkspaceGeneralizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return generalizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed generalizability summary with ${summary.stats.generalizabilityPercent}% meter usage generalizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageGeneralizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production generalizability tools.',
    })
  }
}
