import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getBrokerizabilityRolloutGuidance,
  brokerizabilityAdminActionRequestSchema,
  brokerizabilityAdminActionResponseSchema,
  brokerizabilityAdminSummaryResponseSchema,
  brokerizabilityCapabilitiesResponseSchema,
  brokerizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildBrokerizabilityAdminRecords,
  buildBrokerizabilityAdminStats,
  getBrokerizabilityAdminGuidance,
  resolveBrokerizabilityAdminActions,
} from './brokerizability-admin.helpers.js'
import { evaluateBrokerizabilityRollout } from './brokerizability-rollout.helpers.js'
import { BrokerizabilityStatusService } from './brokerizability-status.service.js'

@Injectable()
export class BrokerizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly brokerizabilityStatusService: BrokerizabilityStatusService,
  ) {}

  getCapabilities() {
    return brokerizabilityCapabilitiesResponseSchema.parse({
      supportsBrokerizabilityRollout: true,
      supportsBrokerizabilityAdminTools: true,
      supportsProviderCredentialBrokerizabilitySignals: true,
      supportsModelRegistryBrokerizabilitySignals: true,
      guidance: getBrokerizabilityRolloutGuidance(),
    })
  }

  async getBrokerizabilityRollout() {
    const brokerizabilityTableCoverage =
      await this.brokerizabilityStatusService.getBrokerizabilityTableCoverage()

    const rollout = evaluateBrokerizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.brokerizabilityStatusService.pingPostgres(),
      existingBrokerizabilityTableCount: brokerizabilityTableCoverage.existingBrokerizabilityTableCount,
      workspaceProviderCredentialsTableExists: brokerizabilityTableCoverage.workspaceProviderCredentialsTableExists,
      modelRegistryEntriesTableExists: brokerizabilityTableCoverage.modelRegistryEntriesTableExists,
      billingWebhookEventsTableExists: brokerizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return brokerizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceBrokerizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageBrokerizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.brokerizabilityStatusService.getWorkspaceBrokerizabilityInventory(
        workspaceId,
      )
    const records = buildBrokerizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.brokerizabilityStatusService.pingPostgres()
    const stats = buildBrokerizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return brokerizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveBrokerizabilityAdminActions(),
      guidance: getBrokerizabilityAdminGuidance({ stats }),
    })
  }

  async executeBrokerizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_brokerizability_summary'
    },
  ) {
    this.assertCanManageBrokerizability(authContext)

    const payload = brokerizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_brokerizability_summary': {
        const summary = await this.getWorkspaceBrokerizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return brokerizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed brokerizability summary with ${summary.stats.brokerizabilityPercent}% provider credential brokerizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageBrokerizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production brokerizability tools.',
    })
  }
}
