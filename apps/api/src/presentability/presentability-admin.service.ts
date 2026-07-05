import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getPresentabilityRolloutGuidance,
  presentabilityAdminActionRequestSchema,
  presentabilityAdminActionResponseSchema,
  presentabilityAdminSummaryResponseSchema,
  presentabilityCapabilitiesResponseSchema,
  presentabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildPresentabilityAdminRecords,
  buildPresentabilityAdminStats,
  getPresentabilityAdminGuidance,
  resolvePresentabilityAdminActions,
} from './presentability-admin.helpers.js'
import { evaluatePresentabilityRollout } from './presentability-rollout.helpers.js'
import { PresentabilityStatusService } from './presentability-status.service.js'

@Injectable()
export class PresentabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly presentabilityStatusService: PresentabilityStatusService,
  ) {}

  getCapabilities() {
    return presentabilityCapabilitiesResponseSchema.parse({
      supportsPresentabilityRollout: true,
      supportsPresentabilityAdminTools: true,
      supportsUsageEventPresentabilitySignals: true,
      supportsMeterUsagePresentabilitySignals: true,
      guidance: getPresentabilityRolloutGuidance(),
    })
  }

  async getPresentabilityRollout() {
    const presentabilityTableCoverage =
      await this.presentabilityStatusService.getPresentabilityTableCoverage()

    const rollout = evaluatePresentabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.presentabilityStatusService.pingPostgres(),
      existingPresentabilityTableCount: presentabilityTableCoverage.existingPresentabilityTableCount,
      usageEventsTableExists: presentabilityTableCoverage.usageEventsTableExists,
      billingMeterUsageReportsTableExists: presentabilityTableCoverage.billingMeterUsageReportsTableExists,
      workspaceUsageLimitsTableExists: presentabilityTableCoverage.workspaceUsageLimitsTableExists,
    })

    return presentabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspacePresentabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManagePresentability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.presentabilityStatusService.getWorkspacePresentabilityInventory(
        workspaceId,
      )
    const records = buildPresentabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.presentabilityStatusService.pingPostgres()
    const stats = buildPresentabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return presentabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolvePresentabilityAdminActions(),
      guidance: getPresentabilityAdminGuidance({ stats }),
    })
  }

  async executePresentabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_presentability_summary'
    },
  ) {
    this.assertCanManagePresentability(authContext)

    const payload = presentabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_presentability_summary': {
        const summary = await this.getWorkspacePresentabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return presentabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed presentability summary with ${summary.stats.presentabilityPercent}% usage event presentability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManagePresentability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production presentability tools.',
    })
  }
}
