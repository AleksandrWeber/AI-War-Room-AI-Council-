import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getRepeatabilityRolloutGuidance,
  repeatabilityAdminActionRequestSchema,
  repeatabilityAdminActionResponseSchema,
  repeatabilityAdminSummaryResponseSchema,
  repeatabilityCapabilitiesResponseSchema,
  repeatabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildRepeatabilityAdminRecords,
  buildRepeatabilityAdminStats,
  getRepeatabilityAdminGuidance,
  resolveRepeatabilityAdminActions,
} from './repeatability-admin.helpers.js'
import { evaluateRepeatabilityRollout } from './repeatability-rollout.helpers.js'
import { RepeatabilityStatusService } from './repeatability-status.service.js'

@Injectable()
export class RepeatabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly repeatabilityStatusService: RepeatabilityStatusService,
  ) {}

  getCapabilities() {
    return repeatabilityCapabilitiesResponseSchema.parse({
      supportsRepeatabilityRollout: true,
      supportsRepeatabilityAdminTools: true,
      supportsArtifactRepeatabilitySignals: true,
      supportsWorkflowRepeatabilitySignals: true,
      guidance: getRepeatabilityRolloutGuidance(),
    })
  }

  async getRepeatabilityRollout() {
    const repeatabilityTableCoverage =
      await this.repeatabilityStatusService.getRepeatabilityTableCoverage()

    const rollout = evaluateRepeatabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.repeatabilityStatusService.pingPostgres(),
      existingRepeatabilityTableCount: repeatabilityTableCoverage.existingRepeatabilityTableCount,
      artifactsTableExists: repeatabilityTableCoverage.artifactsTableExists,
      runWorkflowsTableExists: repeatabilityTableCoverage.runWorkflowsTableExists,
      billingNotificationsTableExists: repeatabilityTableCoverage.billingNotificationsTableExists,
    })

    return repeatabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceRepeatabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageRepeatability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.repeatabilityStatusService.getWorkspaceRepeatabilityInventory(
        workspaceId,
      )
    const records = buildRepeatabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.repeatabilityStatusService.pingPostgres()
    const stats = buildRepeatabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return repeatabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveRepeatabilityAdminActions(),
      guidance: getRepeatabilityAdminGuidance({ stats }),
    })
  }

  async executeRepeatabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_repeatability_summary'
    },
  ) {
    this.assertCanManageRepeatability(authContext)

    const payload = repeatabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_repeatability_summary': {
        const summary = await this.getWorkspaceRepeatabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return repeatabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed repeatability summary with ${summary.stats.repeatabilityPercent}% artifact repeatability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageRepeatability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production repeatability tools.',
    })
  }
}
