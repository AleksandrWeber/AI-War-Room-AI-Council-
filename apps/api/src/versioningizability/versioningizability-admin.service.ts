import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getVersioningizabilityRolloutGuidance,
  versioningizabilityAdminActionRequestSchema,
  versioningizabilityAdminActionResponseSchema,
  versioningizabilityAdminSummaryResponseSchema,
  versioningizabilityCapabilitiesResponseSchema,
  versioningizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildVersioningizabilityAdminRecords,
  buildVersioningizabilityAdminStats,
  getVersioningizabilityAdminGuidance,
  resolveVersioningizabilityAdminActions,
} from './versioningizability-admin.helpers.js'
import { evaluateVersioningizabilityRollout } from './versioningizability-rollout.helpers.js'
import { VersioningizabilityStatusService } from './versioningizability-status.service.js'

@Injectable()
export class VersioningizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly versioningizabilityStatusService: VersioningizabilityStatusService,
  ) {}

  getCapabilities() {
    return versioningizabilityCapabilitiesResponseSchema.parse({
      supportsVersioningizabilityRollout: true,
      supportsVersioningizabilityAdminTools: true,
      supportsIdempotencyKeyVersioningizabilitySignals: true,
      supportsUsageEventVersioningizabilitySignals: true,
      guidance: getVersioningizabilityRolloutGuidance(),
    })
  }

  async getVersioningizabilityRollout() {
    const versioningizabilityTableCoverage =
      await this.versioningizabilityStatusService.getVersioningizabilityTableCoverage()

    const rollout = evaluateVersioningizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.versioningizabilityStatusService.pingPostgres(),
      existingVersioningizabilityTableCount: versioningizabilityTableCoverage.existingVersioningizabilityTableCount,
      idempotencyKeysTableExists: versioningizabilityTableCoverage.idempotencyKeysTableExists,
      usageEventsTableExists: versioningizabilityTableCoverage.usageEventsTableExists,
      billingWebhookEventsTableExists: versioningizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return versioningizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceVersioningizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageVersioningizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.versioningizabilityStatusService.getWorkspaceVersioningizabilityInventory(
        workspaceId,
      )
    const records = buildVersioningizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.versioningizabilityStatusService.pingPostgres()
    const stats = buildVersioningizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return versioningizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveVersioningizabilityAdminActions(),
      guidance: getVersioningizabilityAdminGuidance({ stats }),
    })
  }

  async executeVersioningizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_versioningizability_summary'
    },
  ) {
    this.assertCanManageVersioningizability(authContext)

    const payload = versioningizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_versioningizability_summary': {
        const summary = await this.getWorkspaceVersioningizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return versioningizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed versioningizability summary with ${summary.stats.versioningizabilityPercent}% idempotency key versioningizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageVersioningizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production versioningizability tools.',
    })
  }
}
