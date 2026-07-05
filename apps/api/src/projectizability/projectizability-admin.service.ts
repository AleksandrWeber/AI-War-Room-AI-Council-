import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getProjectizabilityRolloutGuidance,
  projectizabilityAdminActionRequestSchema,
  projectizabilityAdminActionResponseSchema,
  projectizabilityAdminSummaryResponseSchema,
  projectizabilityCapabilitiesResponseSchema,
  projectizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildProjectizabilityAdminRecords,
  buildProjectizabilityAdminStats,
  getProjectizabilityAdminGuidance,
  resolveProjectizabilityAdminActions,
} from './projectizability-admin.helpers.js'
import { evaluateProjectizabilityRollout } from './projectizability-rollout.helpers.js'
import { ProjectizabilityStatusService } from './projectizability-status.service.js'

@Injectable()
export class ProjectizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly projectizabilityStatusService: ProjectizabilityStatusService,
  ) {}

  getCapabilities() {
    return projectizabilityCapabilitiesResponseSchema.parse({
      supportsProjectizabilityRollout: true,
      supportsProjectizabilityAdminTools: true,
      supportsBillingNotificationProjectizabilitySignals: true,
      supportsBillingWebhookProjectizabilitySignals: true,
      guidance: getProjectizabilityRolloutGuidance(),
    })
  }

  async getProjectizabilityRollout() {
    const projectizabilityTableCoverage =
      await this.projectizabilityStatusService.getProjectizabilityTableCoverage()

    const rollout = evaluateProjectizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.projectizabilityStatusService.pingPostgres(),
      existingProjectizabilityTableCount: projectizabilityTableCoverage.existingProjectizabilityTableCount,
      billingNotificationsTableExists: projectizabilityTableCoverage.billingNotificationsTableExists,
      billingWebhookEventsTableExists: projectizabilityTableCoverage.billingWebhookEventsTableExists,
      usageEventsTableExists: projectizabilityTableCoverage.usageEventsTableExists,
    })

    return projectizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceProjectizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageProjectizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.projectizabilityStatusService.getWorkspaceProjectizabilityInventory(
        workspaceId,
      )
    const records = buildProjectizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.projectizabilityStatusService.pingPostgres()
    const stats = buildProjectizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return projectizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveProjectizabilityAdminActions(),
      guidance: getProjectizabilityAdminGuidance({ stats }),
    })
  }

  async executeProjectizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_projectizability_summary'
    },
  ) {
    this.assertCanManageProjectizability(authContext)

    const payload = projectizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_projectizability_summary': {
        const summary = await this.getWorkspaceProjectizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return projectizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed projectizability summary with ${summary.stats.projectizabilityPercent}% billing notification projectizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageProjectizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production projectizability tools.',
    })
  }
}
