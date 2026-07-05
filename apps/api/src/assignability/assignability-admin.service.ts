import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getAssignabilityRolloutGuidance,
  assignabilityAdminActionRequestSchema,
  assignabilityAdminActionResponseSchema,
  assignabilityAdminSummaryResponseSchema,
  assignabilityCapabilitiesResponseSchema,
  assignabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildAssignabilityAdminRecords,
  buildAssignabilityAdminStats,
  getAssignabilityAdminGuidance,
  resolveAssignabilityAdminActions,
} from './assignability-admin.helpers.js'
import { evaluateAssignabilityRollout } from './assignability-rollout.helpers.js'
import { AssignabilityStatusService } from './assignability-status.service.js'

@Injectable()
export class AssignabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly assignabilityStatusService: AssignabilityStatusService,
  ) {}

  getCapabilities() {
    return assignabilityCapabilitiesResponseSchema.parse({
      supportsAssignabilityRollout: true,
      supportsAssignabilityAdminTools: true,
      supportsWorkspaceMembershipAssignabilitySignals: true,
      supportsProviderCredentialAssignabilitySignals: true,
      guidance: getAssignabilityRolloutGuidance(),
    })
  }

  async getAssignabilityRollout() {
    const assignabilityTableCoverage =
      await this.assignabilityStatusService.getAssignabilityTableCoverage()

    const rollout = evaluateAssignabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.assignabilityStatusService.pingPostgres(),
      existingAssignabilityTableCount: assignabilityTableCoverage.existingAssignabilityTableCount,
      workspaceMembershipsTableExists: assignabilityTableCoverage.workspaceMembershipsTableExists,
      workspaceProviderCredentialsTableExists: assignabilityTableCoverage.workspaceProviderCredentialsTableExists,
      billingNotificationsTableExists: assignabilityTableCoverage.billingNotificationsTableExists,
    })

    return assignabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceAssignabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageAssignability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.assignabilityStatusService.getWorkspaceAssignabilityInventory(
        workspaceId,
      )
    const records = buildAssignabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.assignabilityStatusService.pingPostgres()
    const stats = buildAssignabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return assignabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveAssignabilityAdminActions(),
      guidance: getAssignabilityAdminGuidance({ stats }),
    })
  }

  async executeAssignabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_assignability_summary'
    },
  ) {
    this.assertCanManageAssignability(authContext)

    const payload = assignabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_assignability_summary': {
        const summary = await this.getWorkspaceAssignabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return assignabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed assignability summary with ${summary.stats.assignabilityPercent}% workspace membership assignability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageAssignability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production assignability tools.',
    })
  }
}
