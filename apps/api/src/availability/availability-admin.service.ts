import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  availabilityAdminActionRequestSchema,
  availabilityAdminActionResponseSchema,
  availabilityAdminSummaryResponseSchema,
  availabilityCapabilitiesResponseSchema,
  availabilityRolloutResponseSchema,
  getAvailabilityRolloutGuidance,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import { HealthService } from '../health/health.service.js'
import { ReadinessService } from '../health/readiness.service.js'
import {
  buildAvailabilityAdminRecords,
  buildAvailabilityAdminStats,
  getAvailabilityAdminGuidance,
  resolveAvailabilityAdminActions,
} from './availability-admin.helpers.js'
import { evaluateAvailabilityRollout } from './availability-rollout.helpers.js'
import { AvailabilityStatusService } from './availability-status.service.js'

@Injectable()
export class AvailabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly availabilityStatusService: AvailabilityStatusService,
    private readonly healthService: HealthService,
    private readonly readinessService: ReadinessService,
  ) {}

  getCapabilities() {
    return availabilityCapabilitiesResponseSchema.parse({
      supportsAvailabilityRollout: true,
      supportsAvailabilityAdminTools: true,
      supportsRunOutcomeAvailabilitySignals: true,
      supportsDependencyUptimeSignals: true,
      guidance: getAvailabilityRolloutGuidance(),
    })
  }

  async getAvailabilityRollout() {
    const availabilityTableCoverage =
      await this.availabilityStatusService.getAvailabilityTableCoverage()
    const readiness = await this.readinessService.getReadiness()
    const healthyDependencyCount = readiness.dependencies.filter(
      (dependency) => dependency.status === 'up',
    ).length

    const rollout = evaluateAvailabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.availabilityStatusService.pingPostgres(),
      existingAvailabilityTableCount:
        availabilityTableCoverage.existingAvailabilityTableCount,
      apiHealthStatusOk: this.healthService.getStatus().status === 'ok',
      dependencyUptimeReady: readiness.status === 'ready',
      healthyDependencyCount,
      totalDependencyCount: readiness.dependencies.length,
    })

    return availabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceAvailabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageAvailability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.availabilityStatusService.getWorkspaceAvailabilityInventory(
        workspaceId,
      )
    const records = buildAvailabilityAdminRecords(inventoryItems)
    const postgresConnectivity =
      await this.availabilityStatusService.pingPostgres()
    const stats = buildAvailabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return availabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveAvailabilityAdminActions(),
      guidance: getAvailabilityAdminGuidance({ stats }),
    })
  }

  async executeAvailabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_availability_summary'
    },
  ) {
    this.assertCanManageAvailability(authContext)

    const payload = availabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_availability_summary': {
        const summary = await this.getWorkspaceAvailabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return availabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed availability summary with ${summary.stats.availabilityPercent}% run availability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageAvailability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production availability tools.',
    })
  }
}
