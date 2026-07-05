import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getEvocatabilityRolloutGuidance,
  evocatabilityAdminActionRequestSchema,
  evocatabilityAdminActionResponseSchema,
  evocatabilityAdminSummaryResponseSchema,
  evocatabilityCapabilitiesResponseSchema,
  evocatabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildEvocatabilityAdminRecords,
  buildEvocatabilityAdminStats,
  getEvocatabilityAdminGuidance,
  resolveEvocatabilityAdminActions,
} from './evocatability-admin.helpers.js'
import { evaluateEvocatabilityRollout } from './evocatability-rollout.helpers.js'
import { EvocatabilityStatusService } from './evocatability-status.service.js'

@Injectable()
export class EvocatabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly evocatabilityStatusService: EvocatabilityStatusService,
  ) {}

  getCapabilities() {
    return evocatabilityCapabilitiesResponseSchema.parse({
      supportsEvocatabilityRollout: true,
      supportsEvocatabilityAdminTools: true,
      supportsModelHealthEvocatabilitySignals: true,
      supportsModelRegistryEvocatabilitySignals: true,
      guidance: getEvocatabilityRolloutGuidance(),
    })
  }

  async getEvocatabilityRollout() {
    const evocatabilityTableCoverage =
      await this.evocatabilityStatusService.getEvocatabilityTableCoverage()

    const rollout = evaluateEvocatabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.evocatabilityStatusService.pingPostgres(),
      existingEvocatabilityTableCount: evocatabilityTableCoverage.existingEvocatabilityTableCount,
      modelHealthEventsTableExists: evocatabilityTableCoverage.modelHealthEventsTableExists,
      modelRegistryEntriesTableExists: evocatabilityTableCoverage.modelRegistryEntriesTableExists,
      billingRecordsTableExists: evocatabilityTableCoverage.billingRecordsTableExists,
    })

    return evocatabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceEvocatabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageEvocatability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.evocatabilityStatusService.getWorkspaceEvocatabilityInventory(
        workspaceId,
      )
    const records = buildEvocatabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.evocatabilityStatusService.pingPostgres()
    const stats = buildEvocatabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return evocatabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveEvocatabilityAdminActions(),
      guidance: getEvocatabilityAdminGuidance({ stats }),
    })
  }

  async executeEvocatabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_evocatability_summary'
    },
  ) {
    this.assertCanManageEvocatability(authContext)

    const payload = evocatabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_evocatability_summary': {
        const summary = await this.getWorkspaceEvocatabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return evocatabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed evocatability summary with ${summary.stats.evocatabilityPercent}% model health evocatability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageEvocatability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production evocatability tools.',
    })
  }
}
