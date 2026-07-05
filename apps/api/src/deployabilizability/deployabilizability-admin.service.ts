import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getDeployabilizabilityRolloutGuidance,
  deployabilizabilityAdminActionRequestSchema,
  deployabilizabilityAdminActionResponseSchema,
  deployabilizabilityAdminSummaryResponseSchema,
  deployabilizabilityCapabilitiesResponseSchema,
  deployabilizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildDeployabilizabilityAdminRecords,
  buildDeployabilizabilityAdminStats,
  getDeployabilizabilityAdminGuidance,
  resolveDeployabilizabilityAdminActions,
} from './deployabilizability-admin.helpers.js'
import { evaluateDeployabilizabilityRollout } from './deployabilizability-rollout.helpers.js'
import { DeployabilizabilityStatusService } from './deployabilizability-status.service.js'

@Injectable()
export class DeployabilizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly deployabilizabilityStatusService: DeployabilizabilityStatusService,
  ) {}

  getCapabilities() {
    return deployabilizabilityCapabilitiesResponseSchema.parse({
      supportsDeployabilizabilityRollout: true,
      supportsDeployabilizabilityAdminTools: true,
      supportsModelHealthDeployabilizabilitySignals: true,
      supportsModelRegistryDeployabilizabilitySignals: true,
      guidance: getDeployabilizabilityRolloutGuidance(),
    })
  }

  async getDeployabilizabilityRollout() {
    const deployabilizabilityTableCoverage =
      await this.deployabilizabilityStatusService.getDeployabilizabilityTableCoverage()

    const rollout = evaluateDeployabilizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.deployabilizabilityStatusService.pingPostgres(),
      existingDeployabilizabilityTableCount: deployabilizabilityTableCoverage.existingDeployabilizabilityTableCount,
      modelHealthEventsTableExists: deployabilizabilityTableCoverage.modelHealthEventsTableExists,
      modelRegistryEntriesTableExists: deployabilizabilityTableCoverage.modelRegistryEntriesTableExists,
      billingRecordsTableExists: deployabilizabilityTableCoverage.billingRecordsTableExists,
    })

    return deployabilizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceDeployabilizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageDeployabilizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.deployabilizabilityStatusService.getWorkspaceDeployabilizabilityInventory(
        workspaceId,
      )
    const records = buildDeployabilizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.deployabilizabilityStatusService.pingPostgres()
    const stats = buildDeployabilizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return deployabilizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveDeployabilizabilityAdminActions(),
      guidance: getDeployabilizabilityAdminGuidance({ stats }),
    })
  }

  async executeDeployabilizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_deployabilizability_summary'
    },
  ) {
    this.assertCanManageDeployabilizability(authContext)

    const payload = deployabilizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_deployabilizability_summary': {
        const summary = await this.getWorkspaceDeployabilizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return deployabilizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed deployabilizability summary with ${summary.stats.deployabilizabilityPercent}% model health deployabilizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageDeployabilizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production deployabilizability tools.',
    })
  }
}
