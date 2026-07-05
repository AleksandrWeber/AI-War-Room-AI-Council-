import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getArchivizabilityRolloutGuidance,
  archivizabilityAdminActionRequestSchema,
  archivizabilityAdminActionResponseSchema,
  archivizabilityAdminSummaryResponseSchema,
  archivizabilityCapabilitiesResponseSchema,
  archivizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildArchivizabilityAdminRecords,
  buildArchivizabilityAdminStats,
  getArchivizabilityAdminGuidance,
  resolveArchivizabilityAdminActions,
} from './archivizability-admin.helpers.js'
import { evaluateArchivizabilityRollout } from './archivizability-rollout.helpers.js'
import { ArchivizabilityStatusService } from './archivizability-status.service.js'

@Injectable()
export class ArchivizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly archivizabilityStatusService: ArchivizabilityStatusService,
  ) {}

  getCapabilities() {
    return archivizabilityCapabilitiesResponseSchema.parse({
      supportsArchivizabilityRollout: true,
      supportsArchivizabilityAdminTools: true,
      supportsBillingWebhookArchivizabilitySignals: true,
      supportsBillingRecordArchivizabilitySignals: true,
      guidance: getArchivizabilityRolloutGuidance(),
    })
  }

  async getArchivizabilityRollout() {
    const archivizabilityTableCoverage =
      await this.archivizabilityStatusService.getArchivizabilityTableCoverage()

    const rollout = evaluateArchivizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.archivizabilityStatusService.pingPostgres(),
      existingArchivizabilityTableCount: archivizabilityTableCoverage.existingArchivizabilityTableCount,
      billingWebhookEventsTableExists: archivizabilityTableCoverage.billingWebhookEventsTableExists,
      billingRecordsTableExists: archivizabilityTableCoverage.billingRecordsTableExists,
      usageEventsTableExists: archivizabilityTableCoverage.usageEventsTableExists,
    })

    return archivizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceArchivizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageArchivizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.archivizabilityStatusService.getWorkspaceArchivizabilityInventory(
        workspaceId,
      )
    const records = buildArchivizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.archivizabilityStatusService.pingPostgres()
    const stats = buildArchivizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return archivizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveArchivizabilityAdminActions(),
      guidance: getArchivizabilityAdminGuidance({ stats }),
    })
  }

  async executeArchivizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_archivizability_summary'
    },
  ) {
    this.assertCanManageArchivizability(authContext)

    const payload = archivizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_archivizability_summary': {
        const summary = await this.getWorkspaceArchivizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return archivizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed archivizability summary with ${summary.stats.archivizabilityPercent}% billing webhook archivizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageArchivizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production archivizability tools.',
    })
  }
}
