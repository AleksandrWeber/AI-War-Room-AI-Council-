import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getDispatchizabilityRolloutGuidance,
  dispatchizabilityAdminActionRequestSchema,
  dispatchizabilityAdminActionResponseSchema,
  dispatchizabilityAdminSummaryResponseSchema,
  dispatchizabilityCapabilitiesResponseSchema,
  dispatchizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildDispatchizabilityAdminRecords,
  buildDispatchizabilityAdminStats,
  getDispatchizabilityAdminGuidance,
  resolveDispatchizabilityAdminActions,
} from './dispatchizability-admin.helpers.js'
import { evaluateDispatchizabilityRollout } from './dispatchizability-rollout.helpers.js'
import { DispatchizabilityStatusService } from './dispatchizability-status.service.js'

@Injectable()
export class DispatchizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly dispatchizabilityStatusService: DispatchizabilityStatusService,
  ) {}

  getCapabilities() {
    return dispatchizabilityCapabilitiesResponseSchema.parse({
      supportsDispatchizabilityRollout: true,
      supportsDispatchizabilityAdminTools: true,
      supportsModelHealthDispatchizabilitySignals: true,
      supportsModelRegistryDispatchizabilitySignals: true,
      guidance: getDispatchizabilityRolloutGuidance(),
    })
  }

  async getDispatchizabilityRollout() {
    const dispatchizabilityTableCoverage =
      await this.dispatchizabilityStatusService.getDispatchizabilityTableCoverage()

    const rollout = evaluateDispatchizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.dispatchizabilityStatusService.pingPostgres(),
      existingDispatchizabilityTableCount: dispatchizabilityTableCoverage.existingDispatchizabilityTableCount,
      modelHealthEventsTableExists: dispatchizabilityTableCoverage.modelHealthEventsTableExists,
      modelRegistryEntriesTableExists: dispatchizabilityTableCoverage.modelRegistryEntriesTableExists,
      billingRecordsTableExists: dispatchizabilityTableCoverage.billingRecordsTableExists,
    })

    return dispatchizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceDispatchizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageDispatchizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.dispatchizabilityStatusService.getWorkspaceDispatchizabilityInventory(
        workspaceId,
      )
    const records = buildDispatchizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.dispatchizabilityStatusService.pingPostgres()
    const stats = buildDispatchizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return dispatchizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveDispatchizabilityAdminActions(),
      guidance: getDispatchizabilityAdminGuidance({ stats }),
    })
  }

  async executeDispatchizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_dispatchizability_summary'
    },
  ) {
    this.assertCanManageDispatchizability(authContext)

    const payload = dispatchizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_dispatchizability_summary': {
        const summary = await this.getWorkspaceDispatchizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return dispatchizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed dispatchizability summary with ${summary.stats.dispatchizabilityPercent}% model health dispatchizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageDispatchizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production dispatchizability tools.',
    })
  }
}
