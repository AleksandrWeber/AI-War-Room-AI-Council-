import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getDeployabilityvaultizabilityRolloutGuidance,
  deployabilityvaultizabilityAdminActionRequestSchema,
  deployabilityvaultizabilityAdminActionResponseSchema,
  deployabilityvaultizabilityAdminSummaryResponseSchema,
  deployabilityvaultizabilityCapabilitiesResponseSchema,
  deployabilityvaultizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildDeployabilityvaultizabilityAdminRecords,
  buildDeployabilityvaultizabilityAdminStats,
  getDeployabilityvaultizabilityAdminGuidance,
  resolveDeployabilityvaultizabilityAdminActions,
} from './deployabilityvaultizability-admin.helpers.js'
import { evaluateDeployabilityvaultizabilityRollout } from './deployabilityvaultizability-rollout.helpers.js'
import { DeployabilityvaultizabilityStatusService } from './deployabilityvaultizability-status.service.js'

@Injectable()
export class DeployabilityvaultizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly deployabilityvaultizabilityStatusService: DeployabilityvaultizabilityStatusService,
  ) {}

  getCapabilities() {
    return deployabilityvaultizabilityCapabilitiesResponseSchema.parse({
      supportsDeployabilityvaultizabilityRollout: true,
      supportsDeployabilityvaultizabilityAdminTools: true,
      supportsMembershipDeployabilityvaultizabilitySignals: true,
      supportsUsageEventDeployabilityvaultizabilitySignals: true,
      guidance: getDeployabilityvaultizabilityRolloutGuidance(),
    })
  }

  async getDeployabilityvaultizabilityRollout() {
    const deployabilityvaultizabilityTableCoverage =
      await this.deployabilityvaultizabilityStatusService.getDeployabilityvaultizabilityTableCoverage()

    const rollout = evaluateDeployabilityvaultizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.deployabilityvaultizabilityStatusService.pingPostgres(),
      existingDeployabilityvaultizabilityTableCount: deployabilityvaultizabilityTableCoverage.existingDeployabilityvaultizabilityTableCount,
      workspaceMembershipsTableExists: deployabilityvaultizabilityTableCoverage.workspaceMembershipsTableExists,
      usageEventsTableExists: deployabilityvaultizabilityTableCoverage.usageEventsTableExists,
      billingNotificationsTableExists: deployabilityvaultizabilityTableCoverage.billingNotificationsTableExists,
    })

    return deployabilityvaultizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceDeployabilityvaultizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageDeployabilityvaultizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.deployabilityvaultizabilityStatusService.getWorkspaceDeployabilityvaultizabilityInventory(
        workspaceId,
      )
    const records = buildDeployabilityvaultizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.deployabilityvaultizabilityStatusService.pingPostgres()
    const stats = buildDeployabilityvaultizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return deployabilityvaultizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveDeployabilityvaultizabilityAdminActions(),
      guidance: getDeployabilityvaultizabilityAdminGuidance({ stats }),
    })
  }

  async executeDeployabilityvaultizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_deployabilityvaultizability_summary'
    },
  ) {
    this.assertCanManageDeployabilityvaultizability(authContext)

    const payload = deployabilityvaultizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_deployabilityvaultizability_summary': {
        const summary = await this.getWorkspaceDeployabilityvaultizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return deployabilityvaultizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed deployabilityvaultizability summary with ${summary.stats.deployabilityvaultizabilityPercent}% membership deployabilityvaultizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageDeployabilityvaultizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production deployabilityvaultizability tools.',
    })
  }
}
