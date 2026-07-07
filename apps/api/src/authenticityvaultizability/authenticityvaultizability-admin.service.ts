import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getAuthenticityvaultizabilityRolloutGuidance,
  authenticityvaultizabilityAdminActionRequestSchema,
  authenticityvaultizabilityAdminActionResponseSchema,
  authenticityvaultizabilityAdminSummaryResponseSchema,
  authenticityvaultizabilityCapabilitiesResponseSchema,
  authenticityvaultizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildAuthenticityvaultizabilityAdminRecords,
  buildAuthenticityvaultizabilityAdminStats,
  getAuthenticityvaultizabilityAdminGuidance,
  resolveAuthenticityvaultizabilityAdminActions,
} from './authenticityvaultizability-admin.helpers.js'
import { evaluateAuthenticityvaultizabilityRollout } from './authenticityvaultizability-rollout.helpers.js'
import { AuthenticityvaultizabilityStatusService } from './authenticityvaultizability-status.service.js'

@Injectable()
export class AuthenticityvaultizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly authenticityvaultizabilityStatusService: AuthenticityvaultizabilityStatusService,
  ) {}

  getCapabilities() {
    return authenticityvaultizabilityCapabilitiesResponseSchema.parse({
      supportsAuthenticityvaultizabilityRollout: true,
      supportsAuthenticityvaultizabilityAdminTools: true,
      supportsMembershipAuthenticityvaultizabilitySignals: true,
      supportsUsageEventAuthenticityvaultizabilitySignals: true,
      guidance: getAuthenticityvaultizabilityRolloutGuidance(),
    })
  }

  async getAuthenticityvaultizabilityRollout() {
    const authenticityvaultizabilityTableCoverage =
      await this.authenticityvaultizabilityStatusService.getAuthenticityvaultizabilityTableCoverage()

    const rollout = evaluateAuthenticityvaultizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.authenticityvaultizabilityStatusService.pingPostgres(),
      existingAuthenticityvaultizabilityTableCount: authenticityvaultizabilityTableCoverage.existingAuthenticityvaultizabilityTableCount,
      workspaceMembershipsTableExists: authenticityvaultizabilityTableCoverage.workspaceMembershipsTableExists,
      usageEventsTableExists: authenticityvaultizabilityTableCoverage.usageEventsTableExists,
      billingNotificationsTableExists: authenticityvaultizabilityTableCoverage.billingNotificationsTableExists,
    })

    return authenticityvaultizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceAuthenticityvaultizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageAuthenticityvaultizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.authenticityvaultizabilityStatusService.getWorkspaceAuthenticityvaultizabilityInventory(
        workspaceId,
      )
    const records = buildAuthenticityvaultizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.authenticityvaultizabilityStatusService.pingPostgres()
    const stats = buildAuthenticityvaultizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return authenticityvaultizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveAuthenticityvaultizabilityAdminActions(),
      guidance: getAuthenticityvaultizabilityAdminGuidance({ stats }),
    })
  }

  async executeAuthenticityvaultizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_authenticityvaultizability_summary'
    },
  ) {
    this.assertCanManageAuthenticityvaultizability(authContext)

    const payload = authenticityvaultizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_authenticityvaultizability_summary': {
        const summary = await this.getWorkspaceAuthenticityvaultizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return authenticityvaultizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed authenticityvaultizability summary with ${summary.stats.authenticityvaultizabilityPercent}% membership authenticityvaultizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageAuthenticityvaultizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production authenticityvaultizability tools.',
    })
  }
}
