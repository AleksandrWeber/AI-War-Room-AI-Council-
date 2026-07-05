import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getDirectoryizabilityRolloutGuidance,
  directoryizabilityAdminActionRequestSchema,
  directoryizabilityAdminActionResponseSchema,
  directoryizabilityAdminSummaryResponseSchema,
  directoryizabilityCapabilitiesResponseSchema,
  directoryizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildDirectoryizabilityAdminRecords,
  buildDirectoryizabilityAdminStats,
  getDirectoryizabilityAdminGuidance,
  resolveDirectoryizabilityAdminActions,
} from './directoryizability-admin.helpers.js'
import { evaluateDirectoryizabilityRollout } from './directoryizability-rollout.helpers.js'
import { DirectoryizabilityStatusService } from './directoryizability-status.service.js'

@Injectable()
export class DirectoryizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly directoryizabilityStatusService: DirectoryizabilityStatusService,
  ) {}

  getCapabilities() {
    return directoryizabilityCapabilitiesResponseSchema.parse({
      supportsDirectoryizabilityRollout: true,
      supportsDirectoryizabilityAdminTools: true,
      supportsMembershipDirectoryizabilitySignals: true,
      supportsUsageEventDirectoryizabilitySignals: true,
      guidance: getDirectoryizabilityRolloutGuidance(),
    })
  }

  async getDirectoryizabilityRollout() {
    const directoryizabilityTableCoverage =
      await this.directoryizabilityStatusService.getDirectoryizabilityTableCoverage()

    const rollout = evaluateDirectoryizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.directoryizabilityStatusService.pingPostgres(),
      existingDirectoryizabilityTableCount: directoryizabilityTableCoverage.existingDirectoryizabilityTableCount,
      workspaceMembershipsTableExists: directoryizabilityTableCoverage.workspaceMembershipsTableExists,
      usageEventsTableExists: directoryizabilityTableCoverage.usageEventsTableExists,
      billingNotificationsTableExists: directoryizabilityTableCoverage.billingNotificationsTableExists,
    })

    return directoryizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceDirectoryizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageDirectoryizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.directoryizabilityStatusService.getWorkspaceDirectoryizabilityInventory(
        workspaceId,
      )
    const records = buildDirectoryizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.directoryizabilityStatusService.pingPostgres()
    const stats = buildDirectoryizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return directoryizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveDirectoryizabilityAdminActions(),
      guidance: getDirectoryizabilityAdminGuidance({ stats }),
    })
  }

  async executeDirectoryizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_directoryizability_summary'
    },
  ) {
    this.assertCanManageDirectoryizability(authContext)

    const payload = directoryizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_directoryizability_summary': {
        const summary = await this.getWorkspaceDirectoryizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return directoryizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed directoryizability summary with ${summary.stats.directoryizabilityPercent}% membership directoryizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageDirectoryizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production directoryizability tools.',
    })
  }
}
