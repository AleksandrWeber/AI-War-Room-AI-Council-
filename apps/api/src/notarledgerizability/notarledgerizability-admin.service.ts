import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getNotarledgerizabilityRolloutGuidance,
  notarledgerizabilityAdminActionRequestSchema,
  notarledgerizabilityAdminActionResponseSchema,
  notarledgerizabilityAdminSummaryResponseSchema,
  notarledgerizabilityCapabilitiesResponseSchema,
  notarledgerizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildNotarledgerizabilityAdminRecords,
  buildNotarledgerizabilityAdminStats,
  getNotarledgerizabilityAdminGuidance,
  resolveNotarledgerizabilityAdminActions,
} from './notarledgerizability-admin.helpers.js'
import { evaluateNotarledgerizabilityRollout } from './notarledgerizability-rollout.helpers.js'
import { NotarledgerizabilityStatusService } from './notarledgerizability-status.service.js'

@Injectable()
export class NotarledgerizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly notarledgerizabilityStatusService: NotarledgerizabilityStatusService,
  ) {}

  getCapabilities() {
    return notarledgerizabilityCapabilitiesResponseSchema.parse({
      supportsNotarledgerizabilityRollout: true,
      supportsNotarledgerizabilityAdminTools: true,
      supportsMembershipNotarledgerizabilitySignals: true,
      supportsUsageEventNotarledgerizabilitySignals: true,
      guidance: getNotarledgerizabilityRolloutGuidance(),
    })
  }

  async getNotarledgerizabilityRollout() {
    const notarledgerizabilityTableCoverage =
      await this.notarledgerizabilityStatusService.getNotarledgerizabilityTableCoverage()

    const rollout = evaluateNotarledgerizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.notarledgerizabilityStatusService.pingPostgres(),
      existingNotarledgerizabilityTableCount: notarledgerizabilityTableCoverage.existingNotarledgerizabilityTableCount,
      workspaceMembershipsTableExists: notarledgerizabilityTableCoverage.workspaceMembershipsTableExists,
      usageEventsTableExists: notarledgerizabilityTableCoverage.usageEventsTableExists,
      billingNotificationsTableExists: notarledgerizabilityTableCoverage.billingNotificationsTableExists,
    })

    return notarledgerizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceNotarledgerizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageNotarledgerizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.notarledgerizabilityStatusService.getWorkspaceNotarledgerizabilityInventory(
        workspaceId,
      )
    const records = buildNotarledgerizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.notarledgerizabilityStatusService.pingPostgres()
    const stats = buildNotarledgerizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return notarledgerizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveNotarledgerizabilityAdminActions(),
      guidance: getNotarledgerizabilityAdminGuidance({ stats }),
    })
  }

  async executeNotarledgerizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_notarledgerizability_summary'
    },
  ) {
    this.assertCanManageNotarledgerizability(authContext)

    const payload = notarledgerizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_notarledgerizability_summary': {
        const summary = await this.getWorkspaceNotarledgerizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return notarledgerizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed notarledgerizability summary with ${summary.stats.notarledgerizabilityPercent}% membership notarledgerizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageNotarledgerizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production notarledgerizability tools.',
    })
  }
}
