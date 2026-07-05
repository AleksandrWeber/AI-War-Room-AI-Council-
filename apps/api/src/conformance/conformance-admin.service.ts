import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getConformanceRolloutGuidance,
  conformanceAdminActionRequestSchema,
  conformanceAdminActionResponseSchema,
  conformanceAdminSummaryResponseSchema,
  conformanceCapabilitiesResponseSchema,
  conformanceRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildConformanceAdminRecords,
  buildConformanceAdminStats,
  getConformanceAdminGuidance,
  resolveConformanceAdminActions,
} from './conformance-admin.helpers.js'
import { evaluateConformanceRollout } from './conformance-rollout.helpers.js'
import { ConformanceStatusService } from './conformance-status.service.js'

@Injectable()
export class ConformanceAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly conformanceStatusService: ConformanceStatusService,
  ) {}

  getCapabilities() {
    return conformanceCapabilitiesResponseSchema.parse({
      supportsConformanceRollout: true,
      supportsConformanceAdminTools: true,
      supportsShieldScanConformanceSignals: true,
      supportsBillingWebhookConformanceSignals: true,
      guidance: getConformanceRolloutGuidance(),
    })
  }

  async getConformanceRollout() {
    const conformanceTableCoverage =
      await this.conformanceStatusService.getConformanceTableCoverage()

    const rollout = evaluateConformanceRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.conformanceStatusService.pingPostgres(),
      existingConformanceTableCount: conformanceTableCoverage.existingConformanceTableCount,
      shieldScansTableExists: conformanceTableCoverage.shieldScansTableExists,
      billingWebhookEventsTableExists: conformanceTableCoverage.billingWebhookEventsTableExists,
      idempotencyKeysTableExists: conformanceTableCoverage.idempotencyKeysTableExists,
    })

    return conformanceRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceConformanceAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageConformance(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.conformanceStatusService.getWorkspaceConformanceInventory(
        workspaceId,
      )
    const records = buildConformanceAdminRecords(inventoryItems)
    const postgresConnectivity = await this.conformanceStatusService.pingPostgres()
    const stats = buildConformanceAdminStats({
      records,
      postgresConnectivity,
    })

    return conformanceAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveConformanceAdminActions(),
      guidance: getConformanceAdminGuidance({ stats }),
    })
  }

  async executeConformanceAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_conformance_summary'
    },
  ) {
    this.assertCanManageConformance(authContext)

    const payload = conformanceAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_conformance_summary': {
        const summary = await this.getWorkspaceConformanceAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return conformanceAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed conformance summary with ${summary.stats.conformancePercent}% shield scan conformance across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageConformance(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production conformance tools.',
    })
  }
}
