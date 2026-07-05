import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getCoordinationizabilityRolloutGuidance,
  coordinationizabilityAdminActionRequestSchema,
  coordinationizabilityAdminActionResponseSchema,
  coordinationizabilityAdminSummaryResponseSchema,
  coordinationizabilityCapabilitiesResponseSchema,
  coordinationizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildCoordinationizabilityAdminRecords,
  buildCoordinationizabilityAdminStats,
  getCoordinationizabilityAdminGuidance,
  resolveCoordinationizabilityAdminActions,
} from './coordinationizability-admin.helpers.js'
import { evaluateCoordinationizabilityRollout } from './coordinationizability-rollout.helpers.js'
import { CoordinationizabilityStatusService } from './coordinationizability-status.service.js'

@Injectable()
export class CoordinationizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly coordinationizabilityStatusService: CoordinationizabilityStatusService,
  ) {}

  getCapabilities() {
    return coordinationizabilityCapabilitiesResponseSchema.parse({
      supportsCoordinationizabilityRollout: true,
      supportsCoordinationizabilityAdminTools: true,
      supportsIdempotencyKeyCoordinationizabilitySignals: true,
      supportsUsageEventCoordinationizabilitySignals: true,
      guidance: getCoordinationizabilityRolloutGuidance(),
    })
  }

  async getCoordinationizabilityRollout() {
    const coordinationizabilityTableCoverage =
      await this.coordinationizabilityStatusService.getCoordinationizabilityTableCoverage()

    const rollout = evaluateCoordinationizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.coordinationizabilityStatusService.pingPostgres(),
      existingCoordinationizabilityTableCount: coordinationizabilityTableCoverage.existingCoordinationizabilityTableCount,
      idempotencyKeysTableExists: coordinationizabilityTableCoverage.idempotencyKeysTableExists,
      usageEventsTableExists: coordinationizabilityTableCoverage.usageEventsTableExists,
      billingWebhookEventsTableExists: coordinationizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return coordinationizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceCoordinationizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageCoordinationizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.coordinationizabilityStatusService.getWorkspaceCoordinationizabilityInventory(
        workspaceId,
      )
    const records = buildCoordinationizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.coordinationizabilityStatusService.pingPostgres()
    const stats = buildCoordinationizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return coordinationizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveCoordinationizabilityAdminActions(),
      guidance: getCoordinationizabilityAdminGuidance({ stats }),
    })
  }

  async executeCoordinationizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_coordinationizability_summary'
    },
  ) {
    this.assertCanManageCoordinationizability(authContext)

    const payload = coordinationizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_coordinationizability_summary': {
        const summary = await this.getWorkspaceCoordinationizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return coordinationizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed coordinationizability summary with ${summary.stats.coordinationizabilityPercent}% idempotency key coordinationizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageCoordinationizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production coordinationizability tools.',
    })
  }
}
