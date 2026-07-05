import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getTeachabilityRolloutGuidance,
  teachabilityAdminActionRequestSchema,
  teachabilityAdminActionResponseSchema,
  teachabilityAdminSummaryResponseSchema,
  teachabilityCapabilitiesResponseSchema,
  teachabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildTeachabilityAdminRecords,
  buildTeachabilityAdminStats,
  getTeachabilityAdminGuidance,
  resolveTeachabilityAdminActions,
} from './teachability-admin.helpers.js'
import { evaluateTeachabilityRollout } from './teachability-rollout.helpers.js'
import { TeachabilityStatusService } from './teachability-status.service.js'

@Injectable()
export class TeachabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly teachabilityStatusService: TeachabilityStatusService,
  ) {}

  getCapabilities() {
    return teachabilityCapabilitiesResponseSchema.parse({
      supportsTeachabilityRollout: true,
      supportsTeachabilityAdminTools: true,
      supportsWorkflowTeachabilitySignals: true,
      supportsAgentOutputTeachabilitySignals: true,
      guidance: getTeachabilityRolloutGuidance(),
    })
  }

  async getTeachabilityRollout() {
    const teachabilityTableCoverage =
      await this.teachabilityStatusService.getTeachabilityTableCoverage()

    const rollout = evaluateTeachabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.teachabilityStatusService.pingPostgres(),
      existingTeachabilityTableCount: teachabilityTableCoverage.existingTeachabilityTableCount,
      runWorkflowsTableExists: teachabilityTableCoverage.runWorkflowsTableExists,
      agentOutputsTableExists: teachabilityTableCoverage.agentOutputsTableExists,
      workspaceMembershipsTableExists: teachabilityTableCoverage.workspaceMembershipsTableExists,
    })

    return teachabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceTeachabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageTeachability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.teachabilityStatusService.getWorkspaceTeachabilityInventory(
        workspaceId,
      )
    const records = buildTeachabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.teachabilityStatusService.pingPostgres()
    const stats = buildTeachabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return teachabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveTeachabilityAdminActions(),
      guidance: getTeachabilityAdminGuidance({ stats }),
    })
  }

  async executeTeachabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_teachability_summary'
    },
  ) {
    this.assertCanManageTeachability(authContext)

    const payload = teachabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_teachability_summary': {
        const summary = await this.getWorkspaceTeachabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return teachabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed teachability summary with ${summary.stats.teachabilityPercent}% workflow teachability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageTeachability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production teachability tools.',
    })
  }
}
