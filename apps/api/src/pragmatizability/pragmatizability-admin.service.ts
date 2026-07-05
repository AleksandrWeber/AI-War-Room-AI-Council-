import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getPragmatizabilityRolloutGuidance,
  pragmatizabilityAdminActionRequestSchema,
  pragmatizabilityAdminActionResponseSchema,
  pragmatizabilityAdminSummaryResponseSchema,
  pragmatizabilityCapabilitiesResponseSchema,
  pragmatizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildPragmatizabilityAdminRecords,
  buildPragmatizabilityAdminStats,
  getPragmatizabilityAdminGuidance,
  resolvePragmatizabilityAdminActions,
} from './pragmatizability-admin.helpers.js'
import { evaluatePragmatizabilityRollout } from './pragmatizability-rollout.helpers.js'
import { PragmatizabilityStatusService } from './pragmatizability-status.service.js'

@Injectable()
export class PragmatizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly pragmatizabilityStatusService: PragmatizabilityStatusService,
  ) {}

  getCapabilities() {
    return pragmatizabilityCapabilitiesResponseSchema.parse({
      supportsPragmatizabilityRollout: true,
      supportsPragmatizabilityAdminTools: true,
      supportsBillingNotificationPragmatizabilitySignals: true,
      supportsBillingWebhookPragmatizabilitySignals: true,
      guidance: getPragmatizabilityRolloutGuidance(),
    })
  }

  async getPragmatizabilityRollout() {
    const pragmatizabilityTableCoverage =
      await this.pragmatizabilityStatusService.getPragmatizabilityTableCoverage()

    const rollout = evaluatePragmatizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.pragmatizabilityStatusService.pingPostgres(),
      existingPragmatizabilityTableCount: pragmatizabilityTableCoverage.existingPragmatizabilityTableCount,
      billingNotificationsTableExists: pragmatizabilityTableCoverage.billingNotificationsTableExists,
      billingWebhookEventsTableExists: pragmatizabilityTableCoverage.billingWebhookEventsTableExists,
      usageEventsTableExists: pragmatizabilityTableCoverage.usageEventsTableExists,
    })

    return pragmatizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspacePragmatizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManagePragmatizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.pragmatizabilityStatusService.getWorkspacePragmatizabilityInventory(
        workspaceId,
      )
    const records = buildPragmatizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.pragmatizabilityStatusService.pingPostgres()
    const stats = buildPragmatizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return pragmatizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolvePragmatizabilityAdminActions(),
      guidance: getPragmatizabilityAdminGuidance({ stats }),
    })
  }

  async executePragmatizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_pragmatizability_summary'
    },
  ) {
    this.assertCanManagePragmatizability(authContext)

    const payload = pragmatizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_pragmatizability_summary': {
        const summary = await this.getWorkspacePragmatizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return pragmatizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed pragmatizability summary with ${summary.stats.pragmatizabilityPercent}% billing notification pragmatizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManagePragmatizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production pragmatizability tools.',
    })
  }
}
