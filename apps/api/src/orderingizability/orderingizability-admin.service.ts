import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getOrderingizabilityRolloutGuidance,
  orderingizabilityAdminActionRequestSchema,
  orderingizabilityAdminActionResponseSchema,
  orderingizabilityAdminSummaryResponseSchema,
  orderingizabilityCapabilitiesResponseSchema,
  orderingizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildOrderingizabilityAdminRecords,
  buildOrderingizabilityAdminStats,
  getOrderingizabilityAdminGuidance,
  resolveOrderingizabilityAdminActions,
} from './orderingizability-admin.helpers.js'
import { evaluateOrderingizabilityRollout } from './orderingizability-rollout.helpers.js'
import { OrderingizabilityStatusService } from './orderingizability-status.service.js'

@Injectable()
export class OrderingizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly orderingizabilityStatusService: OrderingizabilityStatusService,
  ) {}

  getCapabilities() {
    return orderingizabilityCapabilitiesResponseSchema.parse({
      supportsOrderingizabilityRollout: true,
      supportsOrderingizabilityAdminTools: true,
      supportsMembershipOrderingizabilitySignals: true,
      supportsUsageEventOrderingizabilitySignals: true,
      guidance: getOrderingizabilityRolloutGuidance(),
    })
  }

  async getOrderingizabilityRollout() {
    const orderingizabilityTableCoverage =
      await this.orderingizabilityStatusService.getOrderingizabilityTableCoverage()

    const rollout = evaluateOrderingizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.orderingizabilityStatusService.pingPostgres(),
      existingOrderingizabilityTableCount: orderingizabilityTableCoverage.existingOrderingizabilityTableCount,
      workspaceMembershipsTableExists: orderingizabilityTableCoverage.workspaceMembershipsTableExists,
      usageEventsTableExists: orderingizabilityTableCoverage.usageEventsTableExists,
      billingNotificationsTableExists: orderingizabilityTableCoverage.billingNotificationsTableExists,
    })

    return orderingizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceOrderingizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageOrderingizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.orderingizabilityStatusService.getWorkspaceOrderingizabilityInventory(
        workspaceId,
      )
    const records = buildOrderingizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.orderingizabilityStatusService.pingPostgres()
    const stats = buildOrderingizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return orderingizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveOrderingizabilityAdminActions(),
      guidance: getOrderingizabilityAdminGuidance({ stats }),
    })
  }

  async executeOrderingizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_orderingizability_summary'
    },
  ) {
    this.assertCanManageOrderingizability(authContext)

    const payload = orderingizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_orderingizability_summary': {
        const summary = await this.getWorkspaceOrderingizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return orderingizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed orderingizability summary with ${summary.stats.orderingizabilityPercent}% membership orderingizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageOrderingizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production orderingizability tools.',
    })
  }
}
