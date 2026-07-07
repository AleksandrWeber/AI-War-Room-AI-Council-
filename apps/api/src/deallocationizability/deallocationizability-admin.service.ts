import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getDeallocationizabilityRolloutGuidance,
  deallocationizabilityAdminActionRequestSchema,
  deallocationizabilityAdminActionResponseSchema,
  deallocationizabilityAdminSummaryResponseSchema,
  deallocationizabilityCapabilitiesResponseSchema,
  deallocationizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildDeallocationizabilityAdminRecords,
  buildDeallocationizabilityAdminStats,
  getDeallocationizabilityAdminGuidance,
  resolveDeallocationizabilityAdminActions,
} from './deallocationizability-admin.helpers.js'
import { evaluateDeallocationizabilityRollout } from './deallocationizability-rollout.helpers.js'
import { DeallocationizabilityStatusService } from './deallocationizability-status.service.js'

@Injectable()
export class DeallocationizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly deallocationizabilityStatusService: DeallocationizabilityStatusService,
  ) {}

  getCapabilities() {
    return deallocationizabilityCapabilitiesResponseSchema.parse({
      supportsDeallocationizabilityRollout: true,
      supportsDeallocationizabilityAdminTools: true,
      supportsModelHealthDeallocationizabilitySignals: true,
      supportsModelRegistryDeallocationizabilitySignals: true,
      guidance: getDeallocationizabilityRolloutGuidance(),
    })
  }

  async getDeallocationizabilityRollout() {
    const deallocationizabilityTableCoverage =
      await this.deallocationizabilityStatusService.getDeallocationizabilityTableCoverage()

    const rollout = evaluateDeallocationizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.deallocationizabilityStatusService.pingPostgres(),
      existingDeallocationizabilityTableCount: deallocationizabilityTableCoverage.existingDeallocationizabilityTableCount,
      modelHealthEventsTableExists: deallocationizabilityTableCoverage.modelHealthEventsTableExists,
      modelRegistryEntriesTableExists: deallocationizabilityTableCoverage.modelRegistryEntriesTableExists,
      billingRecordsTableExists: deallocationizabilityTableCoverage.billingRecordsTableExists,
    })

    return deallocationizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceDeallocationizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageDeallocationizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.deallocationizabilityStatusService.getWorkspaceDeallocationizabilityInventory(
        workspaceId,
      )
    const records = buildDeallocationizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.deallocationizabilityStatusService.pingPostgres()
    const stats = buildDeallocationizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return deallocationizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveDeallocationizabilityAdminActions(),
      guidance: getDeallocationizabilityAdminGuidance({ stats }),
    })
  }

  async executeDeallocationizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_deallocationizability_summary'
    },
  ) {
    this.assertCanManageDeallocationizability(authContext)

    const payload = deallocationizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_deallocationizability_summary': {
        const summary = await this.getWorkspaceDeallocationizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return deallocationizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed deallocationizability summary with ${summary.stats.deallocationizabilityPercent}% model health deallocationizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageDeallocationizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production deallocationizability tools.',
    })
  }
}
