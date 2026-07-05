import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getDependableizabilityRolloutGuidance,
  dependableizabilityAdminActionRequestSchema,
  dependableizabilityAdminActionResponseSchema,
  dependableizabilityAdminSummaryResponseSchema,
  dependableizabilityCapabilitiesResponseSchema,
  dependableizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildDependableizabilityAdminRecords,
  buildDependableizabilityAdminStats,
  getDependableizabilityAdminGuidance,
  resolveDependableizabilityAdminActions,
} from './dependableizability-admin.helpers.js'
import { evaluateDependableizabilityRollout } from './dependableizability-rollout.helpers.js'
import { DependableizabilityStatusService } from './dependableizability-status.service.js'

@Injectable()
export class DependableizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly dependableizabilityStatusService: DependableizabilityStatusService,
  ) {}

  getCapabilities() {
    return dependableizabilityCapabilitiesResponseSchema.parse({
      supportsDependableizabilityRollout: true,
      supportsDependableizabilityAdminTools: true,
      supportsBillingNotificationDependableizabilitySignals: true,
      supportsBillingWebhookDependableizabilitySignals: true,
      guidance: getDependableizabilityRolloutGuidance(),
    })
  }

  async getDependableizabilityRollout() {
    const dependableizabilityTableCoverage =
      await this.dependableizabilityStatusService.getDependableizabilityTableCoverage()

    const rollout = evaluateDependableizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.dependableizabilityStatusService.pingPostgres(),
      existingDependableizabilityTableCount: dependableizabilityTableCoverage.existingDependableizabilityTableCount,
      billingNotificationsTableExists: dependableizabilityTableCoverage.billingNotificationsTableExists,
      billingWebhookEventsTableExists: dependableizabilityTableCoverage.billingWebhookEventsTableExists,
      usageEventsTableExists: dependableizabilityTableCoverage.usageEventsTableExists,
    })

    return dependableizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceDependableizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageDependableizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.dependableizabilityStatusService.getWorkspaceDependableizabilityInventory(
        workspaceId,
      )
    const records = buildDependableizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.dependableizabilityStatusService.pingPostgres()
    const stats = buildDependableizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return dependableizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveDependableizabilityAdminActions(),
      guidance: getDependableizabilityAdminGuidance({ stats }),
    })
  }

  async executeDependableizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_dependableizability_summary'
    },
  ) {
    this.assertCanManageDependableizability(authContext)

    const payload = dependableizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_dependableizability_summary': {
        const summary = await this.getWorkspaceDependableizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return dependableizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed dependableizability summary with ${summary.stats.dependableizabilityPercent}% billing notification dependableizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageDependableizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production dependableizability tools.',
    })
  }
}
