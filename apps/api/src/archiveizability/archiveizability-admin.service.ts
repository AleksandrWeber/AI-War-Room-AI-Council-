import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getArchiveizabilityRolloutGuidance,
  archiveizabilityAdminActionRequestSchema,
  archiveizabilityAdminActionResponseSchema,
  archiveizabilityAdminSummaryResponseSchema,
  archiveizabilityCapabilitiesResponseSchema,
  archiveizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildArchiveizabilityAdminRecords,
  buildArchiveizabilityAdminStats,
  getArchiveizabilityAdminGuidance,
  resolveArchiveizabilityAdminActions,
} from './archiveizability-admin.helpers.js'
import { evaluateArchiveizabilityRollout } from './archiveizability-rollout.helpers.js'
import { ArchiveizabilityStatusService } from './archiveizability-status.service.js'

@Injectable()
export class ArchiveizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly archiveizabilityStatusService: ArchiveizabilityStatusService,
  ) {}

  getCapabilities() {
    return archiveizabilityCapabilitiesResponseSchema.parse({
      supportsArchiveizabilityRollout: true,
      supportsArchiveizabilityAdminTools: true,
      supportsBillingNotificationArchiveizabilitySignals: true,
      supportsBillingWebhookArchiveizabilitySignals: true,
      guidance: getArchiveizabilityRolloutGuidance(),
    })
  }

  async getArchiveizabilityRollout() {
    const archiveizabilityTableCoverage =
      await this.archiveizabilityStatusService.getArchiveizabilityTableCoverage()

    const rollout = evaluateArchiveizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.archiveizabilityStatusService.pingPostgres(),
      existingArchiveizabilityTableCount: archiveizabilityTableCoverage.existingArchiveizabilityTableCount,
      billingNotificationsTableExists: archiveizabilityTableCoverage.billingNotificationsTableExists,
      billingWebhookEventsTableExists: archiveizabilityTableCoverage.billingWebhookEventsTableExists,
      usageEventsTableExists: archiveizabilityTableCoverage.usageEventsTableExists,
    })

    return archiveizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceArchiveizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageArchiveizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.archiveizabilityStatusService.getWorkspaceArchiveizabilityInventory(
        workspaceId,
      )
    const records = buildArchiveizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.archiveizabilityStatusService.pingPostgres()
    const stats = buildArchiveizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return archiveizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveArchiveizabilityAdminActions(),
      guidance: getArchiveizabilityAdminGuidance({ stats }),
    })
  }

  async executeArchiveizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_archiveizability_summary'
    },
  ) {
    this.assertCanManageArchiveizability(authContext)

    const payload = archiveizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_archiveizability_summary': {
        const summary = await this.getWorkspaceArchiveizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return archiveizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed archiveizability summary with ${summary.stats.archiveizabilityPercent}% billing notification archiveizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageArchiveizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production archiveizability tools.',
    })
  }
}
