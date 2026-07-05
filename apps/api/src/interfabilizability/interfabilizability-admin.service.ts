import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getInterfabilizabilityRolloutGuidance,
  interfabilizabilityAdminActionRequestSchema,
  interfabilizabilityAdminActionResponseSchema,
  interfabilizabilityAdminSummaryResponseSchema,
  interfabilizabilityCapabilitiesResponseSchema,
  interfabilizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildInterfabilizabilityAdminRecords,
  buildInterfabilizabilityAdminStats,
  getInterfabilizabilityAdminGuidance,
  resolveInterfabilizabilityAdminActions,
} from './interfabilizability-admin.helpers.js'
import { evaluateInterfabilizabilityRollout } from './interfabilizability-rollout.helpers.js'
import { InterfabilizabilityStatusService } from './interfabilizability-status.service.js'

@Injectable()
export class InterfabilizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly interfabilizabilityStatusService: InterfabilizabilityStatusService,
  ) {}

  getCapabilities() {
    return interfabilizabilityCapabilitiesResponseSchema.parse({
      supportsInterfabilizabilityRollout: true,
      supportsInterfabilizabilityAdminTools: true,
      supportsProviderCredentialInterfabilizabilitySignals: true,
      supportsModelRegistryInterfabilizabilitySignals: true,
      guidance: getInterfabilizabilityRolloutGuidance(),
    })
  }

  async getInterfabilizabilityRollout() {
    const interfabilizabilityTableCoverage =
      await this.interfabilizabilityStatusService.getInterfabilizabilityTableCoverage()

    const rollout = evaluateInterfabilizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.interfabilizabilityStatusService.pingPostgres(),
      existingInterfabilizabilityTableCount: interfabilizabilityTableCoverage.existingInterfabilizabilityTableCount,
      workspaceProviderCredentialsTableExists: interfabilizabilityTableCoverage.workspaceProviderCredentialsTableExists,
      modelRegistryEntriesTableExists: interfabilizabilityTableCoverage.modelRegistryEntriesTableExists,
      billingWebhookEventsTableExists: interfabilizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return interfabilizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceInterfabilizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageInterfabilizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.interfabilizabilityStatusService.getWorkspaceInterfabilizabilityInventory(
        workspaceId,
      )
    const records = buildInterfabilizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.interfabilizabilityStatusService.pingPostgres()
    const stats = buildInterfabilizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return interfabilizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveInterfabilizabilityAdminActions(),
      guidance: getInterfabilizabilityAdminGuidance({ stats }),
    })
  }

  async executeInterfabilizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_interfabilizability_summary'
    },
  ) {
    this.assertCanManageInterfabilizability(authContext)

    const payload = interfabilizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_interfabilizability_summary': {
        const summary = await this.getWorkspaceInterfabilizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return interfabilizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed interfabilizability summary with ${summary.stats.interfabilizabilityPercent}% provider credential interfabilizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageInterfabilizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production interfabilizability tools.',
    })
  }
}
