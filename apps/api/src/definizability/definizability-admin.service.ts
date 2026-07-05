import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getDefinizabilityRolloutGuidance,
  definizabilityAdminActionRequestSchema,
  definizabilityAdminActionResponseSchema,
  definizabilityAdminSummaryResponseSchema,
  definizabilityCapabilitiesResponseSchema,
  definizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildDefinizabilityAdminRecords,
  buildDefinizabilityAdminStats,
  getDefinizabilityAdminGuidance,
  resolveDefinizabilityAdminActions,
} from './definizability-admin.helpers.js'
import { evaluateDefinizabilityRollout } from './definizability-rollout.helpers.js'
import { DefinizabilityStatusService } from './definizability-status.service.js'

@Injectable()
export class DefinizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly definizabilityStatusService: DefinizabilityStatusService,
  ) {}

  getCapabilities() {
    return definizabilityCapabilitiesResponseSchema.parse({
      supportsDefinizabilityRollout: true,
      supportsDefinizabilityAdminTools: true,
      supportsMembershipDefinizabilitySignals: true,
      supportsUsageEventDefinizabilitySignals: true,
      guidance: getDefinizabilityRolloutGuidance(),
    })
  }

  async getDefinizabilityRollout() {
    const definizabilityTableCoverage =
      await this.definizabilityStatusService.getDefinizabilityTableCoverage()

    const rollout = evaluateDefinizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.definizabilityStatusService.pingPostgres(),
      existingDefinizabilityTableCount: definizabilityTableCoverage.existingDefinizabilityTableCount,
      workspaceMembershipsTableExists: definizabilityTableCoverage.workspaceMembershipsTableExists,
      usageEventsTableExists: definizabilityTableCoverage.usageEventsTableExists,
      billingNotificationsTableExists: definizabilityTableCoverage.billingNotificationsTableExists,
    })

    return definizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceDefinizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageDefinizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.definizabilityStatusService.getWorkspaceDefinizabilityInventory(
        workspaceId,
      )
    const records = buildDefinizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.definizabilityStatusService.pingPostgres()
    const stats = buildDefinizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return definizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveDefinizabilityAdminActions(),
      guidance: getDefinizabilityAdminGuidance({ stats }),
    })
  }

  async executeDefinizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_definizability_summary'
    },
  ) {
    this.assertCanManageDefinizability(authContext)

    const payload = definizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_definizability_summary': {
        const summary = await this.getWorkspaceDefinizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return definizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed definizability summary with ${summary.stats.definizabilityPercent}% membership definizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageDefinizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production definizability tools.',
    })
  }
}
