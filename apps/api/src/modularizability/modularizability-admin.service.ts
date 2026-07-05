import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getModularizabilityRolloutGuidance,
  modularizabilityAdminActionRequestSchema,
  modularizabilityAdminActionResponseSchema,
  modularizabilityAdminSummaryResponseSchema,
  modularizabilityCapabilitiesResponseSchema,
  modularizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildModularizabilityAdminRecords,
  buildModularizabilityAdminStats,
  getModularizabilityAdminGuidance,
  resolveModularizabilityAdminActions,
} from './modularizability-admin.helpers.js'
import { evaluateModularizabilityRollout } from './modularizability-rollout.helpers.js'
import { ModularizabilityStatusService } from './modularizability-status.service.js'

@Injectable()
export class ModularizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly modularizabilityStatusService: ModularizabilityStatusService,
  ) {}

  getCapabilities() {
    return modularizabilityCapabilitiesResponseSchema.parse({
      supportsModularizabilityRollout: true,
      supportsModularizabilityAdminTools: true,
      supportsMembershipModularizabilitySignals: true,
      supportsUsageEventModularizabilitySignals: true,
      guidance: getModularizabilityRolloutGuidance(),
    })
  }

  async getModularizabilityRollout() {
    const modularizabilityTableCoverage =
      await this.modularizabilityStatusService.getModularizabilityTableCoverage()

    const rollout = evaluateModularizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.modularizabilityStatusService.pingPostgres(),
      existingModularizabilityTableCount: modularizabilityTableCoverage.existingModularizabilityTableCount,
      workspaceMembershipsTableExists: modularizabilityTableCoverage.workspaceMembershipsTableExists,
      usageEventsTableExists: modularizabilityTableCoverage.usageEventsTableExists,
      billingNotificationsTableExists: modularizabilityTableCoverage.billingNotificationsTableExists,
    })

    return modularizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceModularizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageModularizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.modularizabilityStatusService.getWorkspaceModularizabilityInventory(
        workspaceId,
      )
    const records = buildModularizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.modularizabilityStatusService.pingPostgres()
    const stats = buildModularizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return modularizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveModularizabilityAdminActions(),
      guidance: getModularizabilityAdminGuidance({ stats }),
    })
  }

  async executeModularizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_modularizability_summary'
    },
  ) {
    this.assertCanManageModularizability(authContext)

    const payload = modularizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_modularizability_summary': {
        const summary = await this.getWorkspaceModularizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return modularizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed modularizability summary with ${summary.stats.modularizabilityPercent}% membership modularizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageModularizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production modularizability tools.',
    })
  }
}
