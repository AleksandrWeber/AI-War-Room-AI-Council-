import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getDeployabilityRolloutGuidance,
  deployabilityAdminActionRequestSchema,
  deployabilityAdminActionResponseSchema,
  deployabilityAdminSummaryResponseSchema,
  deployabilityCapabilitiesResponseSchema,
  deployabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildDeployabilityAdminRecords,
  buildDeployabilityAdminStats,
  getDeployabilityAdminGuidance,
  resolveDeployabilityAdminActions,
} from './deployability-admin.helpers.js'
import { evaluateDeployabilityRollout } from './deployability-rollout.helpers.js'
import { DeployabilityStatusService } from './deployability-status.service.js'

@Injectable()
export class DeployabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly deployabilityStatusService: DeployabilityStatusService,
  ) {}

  getCapabilities() {
    return deployabilityCapabilitiesResponseSchema.parse({
      supportsDeployabilityRollout: true,
      supportsDeployabilityAdminTools: true,
      supportsProviderCredentialDeployabilitySignals: true,
      supportsBillingWebhookDeployabilitySignals: true,
      guidance: getDeployabilityRolloutGuidance(),
    })
  }

  async getDeployabilityRollout() {
    const deployabilityTableCoverage =
      await this.deployabilityStatusService.getDeployabilityTableCoverage()

    const rollout = evaluateDeployabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.deployabilityStatusService.pingPostgres(),
      existingDeployabilityTableCount: deployabilityTableCoverage.existingDeployabilityTableCount,
      workspaceProviderCredentialsTableExists: deployabilityTableCoverage.workspaceProviderCredentialsTableExists,
      billingWebhookEventsTableExists: deployabilityTableCoverage.billingWebhookEventsTableExists,
      usageEventsTableExists: deployabilityTableCoverage.usageEventsTableExists,
    })

    return deployabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceDeployabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageDeployability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.deployabilityStatusService.getWorkspaceDeployabilityInventory(
        workspaceId,
      )
    const records = buildDeployabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.deployabilityStatusService.pingPostgres()
    const stats = buildDeployabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return deployabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveDeployabilityAdminActions(),
      guidance: getDeployabilityAdminGuidance({ stats }),
    })
  }

  async executeDeployabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_deployability_summary'
    },
  ) {
    this.assertCanManageDeployability(authContext)

    const payload = deployabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_deployability_summary': {
        const summary = await this.getWorkspaceDeployabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return deployabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed deployability summary with ${summary.stats.deployabilityPercent}% provider credential deployability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageDeployability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production deployability tools.',
    })
  }
}
