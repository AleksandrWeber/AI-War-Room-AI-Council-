import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getMirroringizabilityRolloutGuidance,
  mirroringizabilityAdminActionRequestSchema,
  mirroringizabilityAdminActionResponseSchema,
  mirroringizabilityAdminSummaryResponseSchema,
  mirroringizabilityCapabilitiesResponseSchema,
  mirroringizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildMirroringizabilityAdminRecords,
  buildMirroringizabilityAdminStats,
  getMirroringizabilityAdminGuidance,
  resolveMirroringizabilityAdminActions,
} from './mirroringizability-admin.helpers.js'
import { evaluateMirroringizabilityRollout } from './mirroringizability-rollout.helpers.js'
import { MirroringizabilityStatusService } from './mirroringizability-status.service.js'

@Injectable()
export class MirroringizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly mirroringizabilityStatusService: MirroringizabilityStatusService,
  ) {}

  getCapabilities() {
    return mirroringizabilityCapabilitiesResponseSchema.parse({
      supportsMirroringizabilityRollout: true,
      supportsMirroringizabilityAdminTools: true,
      supportsMeterUsageMirroringizabilitySignals: true,
      supportsUsageEventMirroringizabilitySignals: true,
      guidance: getMirroringizabilityRolloutGuidance(),
    })
  }

  async getMirroringizabilityRollout() {
    const mirroringizabilityTableCoverage =
      await this.mirroringizabilityStatusService.getMirroringizabilityTableCoverage()

    const rollout = evaluateMirroringizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.mirroringizabilityStatusService.pingPostgres(),
      existingMirroringizabilityTableCount: mirroringizabilityTableCoverage.existingMirroringizabilityTableCount,
      billingMeterUsageReportsTableExists: mirroringizabilityTableCoverage.billingMeterUsageReportsTableExists,
      usageEventsTableExists: mirroringizabilityTableCoverage.usageEventsTableExists,
      workspaceUsageLimitsTableExists: mirroringizabilityTableCoverage.workspaceUsageLimitsTableExists,
    })

    return mirroringizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceMirroringizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageMirroringizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.mirroringizabilityStatusService.getWorkspaceMirroringizabilityInventory(
        workspaceId,
      )
    const records = buildMirroringizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.mirroringizabilityStatusService.pingPostgres()
    const stats = buildMirroringizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return mirroringizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveMirroringizabilityAdminActions(),
      guidance: getMirroringizabilityAdminGuidance({ stats }),
    })
  }

  async executeMirroringizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_mirroringizability_summary'
    },
  ) {
    this.assertCanManageMirroringizability(authContext)

    const payload = mirroringizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_mirroringizability_summary': {
        const summary = await this.getWorkspaceMirroringizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return mirroringizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed mirroringizability summary with ${summary.stats.mirroringizabilityPercent}% meter usage mirroringizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageMirroringizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production mirroringizability tools.',
    })
  }
}
