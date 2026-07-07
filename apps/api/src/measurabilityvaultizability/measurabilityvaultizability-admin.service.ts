import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getMeasurabilityvaultizabilityRolloutGuidance,
  measurabilityvaultizabilityAdminActionRequestSchema,
  measurabilityvaultizabilityAdminActionResponseSchema,
  measurabilityvaultizabilityAdminSummaryResponseSchema,
  measurabilityvaultizabilityCapabilitiesResponseSchema,
  measurabilityvaultizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildMeasurabilityvaultizabilityAdminRecords,
  buildMeasurabilityvaultizabilityAdminStats,
  getMeasurabilityvaultizabilityAdminGuidance,
  resolveMeasurabilityvaultizabilityAdminActions,
} from './measurabilityvaultizability-admin.helpers.js'
import { evaluateMeasurabilityvaultizabilityRollout } from './measurabilityvaultizability-rollout.helpers.js'
import { MeasurabilityvaultizabilityStatusService } from './measurabilityvaultizability-status.service.js'

@Injectable()
export class MeasurabilityvaultizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly measurabilityvaultizabilityStatusService: MeasurabilityvaultizabilityStatusService,
  ) {}

  getCapabilities() {
    return measurabilityvaultizabilityCapabilitiesResponseSchema.parse({
      supportsMeasurabilityvaultizabilityRollout: true,
      supportsMeasurabilityvaultizabilityAdminTools: true,
      supportsMembershipMeasurabilityvaultizabilitySignals: true,
      supportsUsageEventMeasurabilityvaultizabilitySignals: true,
      guidance: getMeasurabilityvaultizabilityRolloutGuidance(),
    })
  }

  async getMeasurabilityvaultizabilityRollout() {
    const measurabilityvaultizabilityTableCoverage =
      await this.measurabilityvaultizabilityStatusService.getMeasurabilityvaultizabilityTableCoverage()

    const rollout = evaluateMeasurabilityvaultizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.measurabilityvaultizabilityStatusService.pingPostgres(),
      existingMeasurabilityvaultizabilityTableCount: measurabilityvaultizabilityTableCoverage.existingMeasurabilityvaultizabilityTableCount,
      workspaceMembershipsTableExists: measurabilityvaultizabilityTableCoverage.workspaceMembershipsTableExists,
      usageEventsTableExists: measurabilityvaultizabilityTableCoverage.usageEventsTableExists,
      billingNotificationsTableExists: measurabilityvaultizabilityTableCoverage.billingNotificationsTableExists,
    })

    return measurabilityvaultizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceMeasurabilityvaultizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageMeasurabilityvaultizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.measurabilityvaultizabilityStatusService.getWorkspaceMeasurabilityvaultizabilityInventory(
        workspaceId,
      )
    const records = buildMeasurabilityvaultizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.measurabilityvaultizabilityStatusService.pingPostgres()
    const stats = buildMeasurabilityvaultizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return measurabilityvaultizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveMeasurabilityvaultizabilityAdminActions(),
      guidance: getMeasurabilityvaultizabilityAdminGuidance({ stats }),
    })
  }

  async executeMeasurabilityvaultizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_measurabilityvaultizability_summary'
    },
  ) {
    this.assertCanManageMeasurabilityvaultizability(authContext)

    const payload = measurabilityvaultizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_measurabilityvaultizability_summary': {
        const summary = await this.getWorkspaceMeasurabilityvaultizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return measurabilityvaultizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed measurabilityvaultizability summary with ${summary.stats.measurabilityvaultizabilityPercent}% membership measurabilityvaultizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageMeasurabilityvaultizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production measurabilityvaultizability tools.',
    })
  }
}
