import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getAdaptabilityvaultizabilityRolloutGuidance,
  adaptabilityvaultizabilityAdminActionRequestSchema,
  adaptabilityvaultizabilityAdminActionResponseSchema,
  adaptabilityvaultizabilityAdminSummaryResponseSchema,
  adaptabilityvaultizabilityCapabilitiesResponseSchema,
  adaptabilityvaultizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildAdaptabilityvaultizabilityAdminRecords,
  buildAdaptabilityvaultizabilityAdminStats,
  getAdaptabilityvaultizabilityAdminGuidance,
  resolveAdaptabilityvaultizabilityAdminActions,
} from './adaptabilityvaultizability-admin.helpers.js'
import { evaluateAdaptabilityvaultizabilityRollout } from './adaptabilityvaultizability-rollout.helpers.js'
import { AdaptabilityvaultizabilityStatusService } from './adaptabilityvaultizability-status.service.js'

@Injectable()
export class AdaptabilityvaultizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly adaptabilityvaultizabilityStatusService: AdaptabilityvaultizabilityStatusService,
  ) {}

  getCapabilities() {
    return adaptabilityvaultizabilityCapabilitiesResponseSchema.parse({
      supportsAdaptabilityvaultizabilityRollout: true,
      supportsAdaptabilityvaultizabilityAdminTools: true,
      supportsMembershipAdaptabilityvaultizabilitySignals: true,
      supportsUsageEventAdaptabilityvaultizabilitySignals: true,
      guidance: getAdaptabilityvaultizabilityRolloutGuidance(),
    })
  }

  async getAdaptabilityvaultizabilityRollout() {
    const adaptabilityvaultizabilityTableCoverage =
      await this.adaptabilityvaultizabilityStatusService.getAdaptabilityvaultizabilityTableCoverage()

    const rollout = evaluateAdaptabilityvaultizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.adaptabilityvaultizabilityStatusService.pingPostgres(),
      existingAdaptabilityvaultizabilityTableCount: adaptabilityvaultizabilityTableCoverage.existingAdaptabilityvaultizabilityTableCount,
      workspaceMembershipsTableExists: adaptabilityvaultizabilityTableCoverage.workspaceMembershipsTableExists,
      usageEventsTableExists: adaptabilityvaultizabilityTableCoverage.usageEventsTableExists,
      billingNotificationsTableExists: adaptabilityvaultizabilityTableCoverage.billingNotificationsTableExists,
    })

    return adaptabilityvaultizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceAdaptabilityvaultizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageAdaptabilityvaultizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.adaptabilityvaultizabilityStatusService.getWorkspaceAdaptabilityvaultizabilityInventory(
        workspaceId,
      )
    const records = buildAdaptabilityvaultizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.adaptabilityvaultizabilityStatusService.pingPostgres()
    const stats = buildAdaptabilityvaultizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return adaptabilityvaultizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveAdaptabilityvaultizabilityAdminActions(),
      guidance: getAdaptabilityvaultizabilityAdminGuidance({ stats }),
    })
  }

  async executeAdaptabilityvaultizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_adaptabilityvaultizability_summary'
    },
  ) {
    this.assertCanManageAdaptabilityvaultizability(authContext)

    const payload = adaptabilityvaultizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_adaptabilityvaultizability_summary': {
        const summary = await this.getWorkspaceAdaptabilityvaultizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return adaptabilityvaultizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed adaptabilityvaultizability summary with ${summary.stats.adaptabilityvaultizabilityPercent}% membership adaptabilityvaultizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageAdaptabilityvaultizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production adaptabilityvaultizability tools.',
    })
  }
}
