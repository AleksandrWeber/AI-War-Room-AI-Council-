import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getTransparencyRolloutGuidance,
  transparencyAdminActionRequestSchema,
  transparencyAdminActionResponseSchema,
  transparencyAdminSummaryResponseSchema,
  transparencyCapabilitiesResponseSchema,
  transparencyRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildTransparencyAdminRecords,
  buildTransparencyAdminStats,
  getTransparencyAdminGuidance,
  resolveTransparencyAdminActions,
} from './transparency-admin.helpers.js'
import { evaluateTransparencyRollout } from './transparency-rollout.helpers.js'
import { TransparencyStatusService } from './transparency-status.service.js'

@Injectable()
export class TransparencyAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly transparencyStatusService: TransparencyStatusService,
  ) {}

  getCapabilities() {
    return transparencyCapabilitiesResponseSchema.parse({
      supportsTransparencyRollout: true,
      supportsTransparencyAdminTools: true,
      supportsWorkflowTransparencySignals: true,
      supportsBillingTransparencySignals: true,
      guidance: getTransparencyRolloutGuidance(),
    })
  }

  async getTransparencyRollout() {
    const transparencyTableCoverage =
      await this.transparencyStatusService.getTransparencyTableCoverage()

    const rollout = evaluateTransparencyRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity:
        await this.transparencyStatusService.pingPostgres(),
      existingTransparencyTableCount:
        transparencyTableCoverage.existingTransparencyTableCount,
      runWorkflowsTableExists:
        transparencyTableCoverage.runWorkflowsTableExists,
      billingNotificationsTableExists:
        transparencyTableCoverage.billingNotificationsTableExists,
      billingMeterUsageReportsTableExists:
        transparencyTableCoverage.billingMeterUsageReportsTableExists,
    })

    return transparencyRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceTransparencyAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageTransparency(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.transparencyStatusService.getWorkspaceTransparencyInventory(
        workspaceId,
      )
    const records = buildTransparencyAdminRecords(inventoryItems)
    const postgresConnectivity =
      await this.transparencyStatusService.pingPostgres()
    const stats = buildTransparencyAdminStats({
      records,
      postgresConnectivity,
    })

    return transparencyAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveTransparencyAdminActions(),
      guidance: getTransparencyAdminGuidance({ stats }),
    })
  }

  async executeTransparencyAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_transparency_summary'
    },
  ) {
    this.assertCanManageTransparency(authContext)

    const payload = transparencyAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_transparency_summary': {
        const summary = await this.getWorkspaceTransparencyAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return transparencyAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed transparency summary with ${summary.stats.transparencyPercent}% workflow transparency across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageTransparency(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production transparency tools.',
    })
  }
}
