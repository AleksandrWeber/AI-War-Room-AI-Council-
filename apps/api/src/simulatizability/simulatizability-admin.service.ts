import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getSimulatizabilityRolloutGuidance,
  simulatizabilityAdminActionRequestSchema,
  simulatizabilityAdminActionResponseSchema,
  simulatizabilityAdminSummaryResponseSchema,
  simulatizabilityCapabilitiesResponseSchema,
  simulatizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildSimulatizabilityAdminRecords,
  buildSimulatizabilityAdminStats,
  getSimulatizabilityAdminGuidance,
  resolveSimulatizabilityAdminActions,
} from './simulatizability-admin.helpers.js'
import { evaluateSimulatizabilityRollout } from './simulatizability-rollout.helpers.js'
import { SimulatizabilityStatusService } from './simulatizability-status.service.js'

@Injectable()
export class SimulatizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly simulatizabilityStatusService: SimulatizabilityStatusService,
  ) {}

  getCapabilities() {
    return simulatizabilityCapabilitiesResponseSchema.parse({
      supportsSimulatizabilityRollout: true,
      supportsSimulatizabilityAdminTools: true,
      supportsProviderCredentialSimulatizabilitySignals: true,
      supportsModelRegistrySimulatizabilitySignals: true,
      guidance: getSimulatizabilityRolloutGuidance(),
    })
  }

  async getSimulatizabilityRollout() {
    const simulatizabilityTableCoverage =
      await this.simulatizabilityStatusService.getSimulatizabilityTableCoverage()

    const rollout = evaluateSimulatizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.simulatizabilityStatusService.pingPostgres(),
      existingSimulatizabilityTableCount: simulatizabilityTableCoverage.existingSimulatizabilityTableCount,
      workspaceProviderCredentialsTableExists: simulatizabilityTableCoverage.workspaceProviderCredentialsTableExists,
      modelRegistryEntriesTableExists: simulatizabilityTableCoverage.modelRegistryEntriesTableExists,
      billingWebhookEventsTableExists: simulatizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return simulatizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceSimulatizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageSimulatizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.simulatizabilityStatusService.getWorkspaceSimulatizabilityInventory(
        workspaceId,
      )
    const records = buildSimulatizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.simulatizabilityStatusService.pingPostgres()
    const stats = buildSimulatizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return simulatizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveSimulatizabilityAdminActions(),
      guidance: getSimulatizabilityAdminGuidance({ stats }),
    })
  }

  async executeSimulatizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_simulatizability_summary'
    },
  ) {
    this.assertCanManageSimulatizability(authContext)

    const payload = simulatizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_simulatizability_summary': {
        const summary = await this.getWorkspaceSimulatizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return simulatizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed simulatizability summary with ${summary.stats.simulatizabilityPercent}% provider credential simulatizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageSimulatizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production simulatizability tools.',
    })
  }
}
