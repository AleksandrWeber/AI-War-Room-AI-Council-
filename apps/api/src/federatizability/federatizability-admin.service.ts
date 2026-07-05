import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getFederatizabilityRolloutGuidance,
  federatizabilityAdminActionRequestSchema,
  federatizabilityAdminActionResponseSchema,
  federatizabilityAdminSummaryResponseSchema,
  federatizabilityCapabilitiesResponseSchema,
  federatizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildFederatizabilityAdminRecords,
  buildFederatizabilityAdminStats,
  getFederatizabilityAdminGuidance,
  resolveFederatizabilityAdminActions,
} from './federatizability-admin.helpers.js'
import { evaluateFederatizabilityRollout } from './federatizability-rollout.helpers.js'
import { FederatizabilityStatusService } from './federatizability-status.service.js'

@Injectable()
export class FederatizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly federatizabilityStatusService: FederatizabilityStatusService,
  ) {}

  getCapabilities() {
    return federatizabilityCapabilitiesResponseSchema.parse({
      supportsFederatizabilityRollout: true,
      supportsFederatizabilityAdminTools: true,
      supportsWorkspaceLimitFederatizabilitySignals: true,
      supportsUsageEventFederatizabilitySignals: true,
      guidance: getFederatizabilityRolloutGuidance(),
    })
  }

  async getFederatizabilityRollout() {
    const federatizabilityTableCoverage =
      await this.federatizabilityStatusService.getFederatizabilityTableCoverage()

    const rollout = evaluateFederatizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.federatizabilityStatusService.pingPostgres(),
      existingFederatizabilityTableCount: federatizabilityTableCoverage.existingFederatizabilityTableCount,
      workspaceUsageLimitsTableExists: federatizabilityTableCoverage.workspaceUsageLimitsTableExists,
      usageEventsTableExists: federatizabilityTableCoverage.usageEventsTableExists,
      billingRecordsTableExists: federatizabilityTableCoverage.billingRecordsTableExists,
    })

    return federatizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceFederatizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageFederatizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.federatizabilityStatusService.getWorkspaceFederatizabilityInventory(
        workspaceId,
      )
    const records = buildFederatizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.federatizabilityStatusService.pingPostgres()
    const stats = buildFederatizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return federatizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveFederatizabilityAdminActions(),
      guidance: getFederatizabilityAdminGuidance({ stats }),
    })
  }

  async executeFederatizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_federatizability_summary'
    },
  ) {
    this.assertCanManageFederatizability(authContext)

    const payload = federatizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_federatizability_summary': {
        const summary = await this.getWorkspaceFederatizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return federatizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed federatizability summary with ${summary.stats.federatizabilityPercent}% workspace limit federatizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageFederatizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production federatizability tools.',
    })
  }
}
