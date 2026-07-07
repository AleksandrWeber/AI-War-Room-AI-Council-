import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getPermissionizabilityRolloutGuidance,
  permissionizabilityAdminActionRequestSchema,
  permissionizabilityAdminActionResponseSchema,
  permissionizabilityAdminSummaryResponseSchema,
  permissionizabilityCapabilitiesResponseSchema,
  permissionizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildPermissionizabilityAdminRecords,
  buildPermissionizabilityAdminStats,
  getPermissionizabilityAdminGuidance,
  resolvePermissionizabilityAdminActions,
} from './permissionizability-admin.helpers.js'
import { evaluatePermissionizabilityRollout } from './permissionizability-rollout.helpers.js'
import { PermissionizabilityStatusService } from './permissionizability-status.service.js'

@Injectable()
export class PermissionizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly permissionizabilityStatusService: PermissionizabilityStatusService,
  ) {}

  getCapabilities() {
    return permissionizabilityCapabilitiesResponseSchema.parse({
      supportsPermissionizabilityRollout: true,
      supportsPermissionizabilityAdminTools: true,
      supportsMembershipPermissionizabilitySignals: true,
      supportsUsageEventPermissionizabilitySignals: true,
      guidance: getPermissionizabilityRolloutGuidance(),
    })
  }

  async getPermissionizabilityRollout() {
    const permissionizabilityTableCoverage =
      await this.permissionizabilityStatusService.getPermissionizabilityTableCoverage()

    const rollout = evaluatePermissionizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.permissionizabilityStatusService.pingPostgres(),
      existingPermissionizabilityTableCount: permissionizabilityTableCoverage.existingPermissionizabilityTableCount,
      workspaceMembershipsTableExists: permissionizabilityTableCoverage.workspaceMembershipsTableExists,
      usageEventsTableExists: permissionizabilityTableCoverage.usageEventsTableExists,
      billingNotificationsTableExists: permissionizabilityTableCoverage.billingNotificationsTableExists,
    })

    return permissionizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspacePermissionizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManagePermissionizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.permissionizabilityStatusService.getWorkspacePermissionizabilityInventory(
        workspaceId,
      )
    const records = buildPermissionizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.permissionizabilityStatusService.pingPostgres()
    const stats = buildPermissionizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return permissionizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolvePermissionizabilityAdminActions(),
      guidance: getPermissionizabilityAdminGuidance({ stats }),
    })
  }

  async executePermissionizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_permissionizability_summary'
    },
  ) {
    this.assertCanManagePermissionizability(authContext)

    const payload = permissionizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_permissionizability_summary': {
        const summary = await this.getWorkspacePermissionizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return permissionizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed permissionizability summary with ${summary.stats.permissionizabilityPercent}% membership permissionizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManagePermissionizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production permissionizability tools.',
    })
  }
}
