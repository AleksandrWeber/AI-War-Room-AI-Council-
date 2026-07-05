import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getAdoptabilityRolloutGuidance,
  adoptabilityAdminActionRequestSchema,
  adoptabilityAdminActionResponseSchema,
  adoptabilityAdminSummaryResponseSchema,
  adoptabilityCapabilitiesResponseSchema,
  adoptabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildAdoptabilityAdminRecords,
  buildAdoptabilityAdminStats,
  getAdoptabilityAdminGuidance,
  resolveAdoptabilityAdminActions,
} from './adoptability-admin.helpers.js'
import { evaluateAdoptabilityRollout } from './adoptability-rollout.helpers.js'
import { AdoptabilityStatusService } from './adoptability-status.service.js'

@Injectable()
export class AdoptabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly adoptabilityStatusService: AdoptabilityStatusService,
  ) {}

  getCapabilities() {
    return adoptabilityCapabilitiesResponseSchema.parse({
      supportsAdoptabilityRollout: true,
      supportsAdoptabilityAdminTools: true,
      supportsUsageEventAdoptabilitySignals: true,
      supportsMembershipAdoptabilitySignals: true,
      guidance: getAdoptabilityRolloutGuidance(),
    })
  }

  async getAdoptabilityRollout() {
    const adoptabilityTableCoverage =
      await this.adoptabilityStatusService.getAdoptabilityTableCoverage()

    const rollout = evaluateAdoptabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.adoptabilityStatusService.pingPostgres(),
      existingAdoptabilityTableCount: adoptabilityTableCoverage.existingAdoptabilityTableCount,
      usageEventsTableExists: adoptabilityTableCoverage.usageEventsTableExists,
      workspaceMembershipsTableExists: adoptabilityTableCoverage.workspaceMembershipsTableExists,
      billingNotificationsTableExists: adoptabilityTableCoverage.billingNotificationsTableExists,
    })

    return adoptabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceAdoptabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageAdoptability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.adoptabilityStatusService.getWorkspaceAdoptabilityInventory(
        workspaceId,
      )
    const records = buildAdoptabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.adoptabilityStatusService.pingPostgres()
    const stats = buildAdoptabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return adoptabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveAdoptabilityAdminActions(),
      guidance: getAdoptabilityAdminGuidance({ stats }),
    })
  }

  async executeAdoptabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_adoptability_summary'
    },
  ) {
    this.assertCanManageAdoptability(authContext)

    const payload = adoptabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_adoptability_summary': {
        const summary = await this.getWorkspaceAdoptabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return adoptabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed adoptability summary with ${summary.stats.adoptabilityPercent}% usage event adoptability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageAdoptability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production adoptability tools.',
    })
  }
}
