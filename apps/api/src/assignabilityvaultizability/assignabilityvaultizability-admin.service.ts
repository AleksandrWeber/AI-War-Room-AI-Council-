import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getAssignabilityvaultizabilityRolloutGuidance,
  assignabilityvaultizabilityAdminActionRequestSchema,
  assignabilityvaultizabilityAdminActionResponseSchema,
  assignabilityvaultizabilityAdminSummaryResponseSchema,
  assignabilityvaultizabilityCapabilitiesResponseSchema,
  assignabilityvaultizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildAssignabilityvaultizabilityAdminRecords,
  buildAssignabilityvaultizabilityAdminStats,
  getAssignabilityvaultizabilityAdminGuidance,
  resolveAssignabilityvaultizabilityAdminActions,
} from './assignabilityvaultizability-admin.helpers.js'
import { evaluateAssignabilityvaultizabilityRollout } from './assignabilityvaultizability-rollout.helpers.js'
import { AssignabilityvaultizabilityStatusService } from './assignabilityvaultizability-status.service.js'

@Injectable()
export class AssignabilityvaultizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly assignabilityvaultizabilityStatusService: AssignabilityvaultizabilityStatusService,
  ) {}

  getCapabilities() {
    return assignabilityvaultizabilityCapabilitiesResponseSchema.parse({
      supportsAssignabilityvaultizabilityRollout: true,
      supportsAssignabilityvaultizabilityAdminTools: true,
      supportsBillingNotificationAssignabilityvaultizabilitySignals: true,
      supportsBillingWebhookAssignabilityvaultizabilitySignals: true,
      guidance: getAssignabilityvaultizabilityRolloutGuidance(),
    })
  }

  async getAssignabilityvaultizabilityRollout() {
    const assignabilityvaultizabilityTableCoverage =
      await this.assignabilityvaultizabilityStatusService.getAssignabilityvaultizabilityTableCoverage()

    const rollout = evaluateAssignabilityvaultizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.assignabilityvaultizabilityStatusService.pingPostgres(),
      existingAssignabilityvaultizabilityTableCount: assignabilityvaultizabilityTableCoverage.existingAssignabilityvaultizabilityTableCount,
      billingNotificationsTableExists: assignabilityvaultizabilityTableCoverage.billingNotificationsTableExists,
      billingWebhookEventsTableExists: assignabilityvaultizabilityTableCoverage.billingWebhookEventsTableExists,
      usageEventsTableExists: assignabilityvaultizabilityTableCoverage.usageEventsTableExists,
    })

    return assignabilityvaultizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceAssignabilityvaultizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageAssignabilityvaultizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.assignabilityvaultizabilityStatusService.getWorkspaceAssignabilityvaultizabilityInventory(
        workspaceId,
      )
    const records = buildAssignabilityvaultizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.assignabilityvaultizabilityStatusService.pingPostgres()
    const stats = buildAssignabilityvaultizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return assignabilityvaultizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveAssignabilityvaultizabilityAdminActions(),
      guidance: getAssignabilityvaultizabilityAdminGuidance({ stats }),
    })
  }

  async executeAssignabilityvaultizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_assignabilityvaultizability_summary'
    },
  ) {
    this.assertCanManageAssignabilityvaultizability(authContext)

    const payload = assignabilityvaultizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_assignabilityvaultizability_summary': {
        const summary = await this.getWorkspaceAssignabilityvaultizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return assignabilityvaultizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed assignabilityvaultizability summary with ${summary.stats.assignabilityvaultizabilityPercent}% billing notification assignabilityvaultizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageAssignabilityvaultizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production assignabilityvaultizability tools.',
    })
  }
}
