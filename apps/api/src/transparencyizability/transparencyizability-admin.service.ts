import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getTransparencyizabilityRolloutGuidance,
  transparencyizabilityAdminActionRequestSchema,
  transparencyizabilityAdminActionResponseSchema,
  transparencyizabilityAdminSummaryResponseSchema,
  transparencyizabilityCapabilitiesResponseSchema,
  transparencyizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildTransparencyizabilityAdminRecords,
  buildTransparencyizabilityAdminStats,
  getTransparencyizabilityAdminGuidance,
  resolveTransparencyizabilityAdminActions,
} from './transparencyizability-admin.helpers.js'
import { evaluateTransparencyizabilityRollout } from './transparencyizability-rollout.helpers.js'
import { TransparencyizabilityStatusService } from './transparencyizability-status.service.js'

@Injectable()
export class TransparencyizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly transparencyizabilityStatusService: TransparencyizabilityStatusService,
  ) {}

  getCapabilities() {
    return transparencyizabilityCapabilitiesResponseSchema.parse({
      supportsTransparencyizabilityRollout: true,
      supportsTransparencyizabilityAdminTools: true,
      supportsIdempotencyKeyTransparencyizabilitySignals: true,
      supportsUsageEventTransparencyizabilitySignals: true,
      guidance: getTransparencyizabilityRolloutGuidance(),
    })
  }

  async getTransparencyizabilityRollout() {
    const transparencyizabilityTableCoverage =
      await this.transparencyizabilityStatusService.getTransparencyizabilityTableCoverage()

    const rollout = evaluateTransparencyizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.transparencyizabilityStatusService.pingPostgres(),
      existingTransparencyizabilityTableCount: transparencyizabilityTableCoverage.existingTransparencyizabilityTableCount,
      idempotencyKeysTableExists: transparencyizabilityTableCoverage.idempotencyKeysTableExists,
      usageEventsTableExists: transparencyizabilityTableCoverage.usageEventsTableExists,
      billingWebhookEventsTableExists: transparencyizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return transparencyizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceTransparencyizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageTransparencyizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.transparencyizabilityStatusService.getWorkspaceTransparencyizabilityInventory(
        workspaceId,
      )
    const records = buildTransparencyizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.transparencyizabilityStatusService.pingPostgres()
    const stats = buildTransparencyizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return transparencyizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveTransparencyizabilityAdminActions(),
      guidance: getTransparencyizabilityAdminGuidance({ stats }),
    })
  }

  async executeTransparencyizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_transparencyizability_summary'
    },
  ) {
    this.assertCanManageTransparencyizability(authContext)

    const payload = transparencyizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_transparencyizability_summary': {
        const summary = await this.getWorkspaceTransparencyizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return transparencyizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed transparencyizability summary with ${summary.stats.transparencyizabilityPercent}% idempotency key transparencyizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageTransparencyizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production transparencyizability tools.',
    })
  }
}
