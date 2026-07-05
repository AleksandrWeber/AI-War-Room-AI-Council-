import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getAppropriatenessRolloutGuidance,
  appropriatenessAdminActionRequestSchema,
  appropriatenessAdminActionResponseSchema,
  appropriatenessAdminSummaryResponseSchema,
  appropriatenessCapabilitiesResponseSchema,
  appropriatenessRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildAppropriatenessAdminRecords,
  buildAppropriatenessAdminStats,
  getAppropriatenessAdminGuidance,
  resolveAppropriatenessAdminActions,
} from './appropriateness-admin.helpers.js'
import { evaluateAppropriatenessRollout } from './appropriateness-rollout.helpers.js'
import { AppropriatenessStatusService } from './appropriateness-status.service.js'

@Injectable()
export class AppropriatenessAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly appropriatenessStatusService: AppropriatenessStatusService,
  ) {}

  getCapabilities() {
    return appropriatenessCapabilitiesResponseSchema.parse({
      supportsAppropriatenessRollout: true,
      supportsAppropriatenessAdminTools: true,
      supportsBillingInvoiceAppropriatenessSignals: true,
      supportsBillingRecordAppropriatenessSignals: true,
      guidance: getAppropriatenessRolloutGuidance(),
    })
  }

  async getAppropriatenessRollout() {
    const appropriatenessTableCoverage =
      await this.appropriatenessStatusService.getAppropriatenessTableCoverage()

    const rollout = evaluateAppropriatenessRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.appropriatenessStatusService.pingPostgres(),
      existingAppropriatenessTableCount: appropriatenessTableCoverage.existingAppropriatenessTableCount,
      billingInvoicesTableExists: appropriatenessTableCoverage.billingInvoicesTableExists,
      billingRecordsTableExists: appropriatenessTableCoverage.billingRecordsTableExists,
      billingNotificationsTableExists: appropriatenessTableCoverage.billingNotificationsTableExists,
    })

    return appropriatenessRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceAppropriatenessAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageAppropriateness(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.appropriatenessStatusService.getWorkspaceAppropriatenessInventory(
        workspaceId,
      )
    const records = buildAppropriatenessAdminRecords(inventoryItems)
    const postgresConnectivity = await this.appropriatenessStatusService.pingPostgres()
    const stats = buildAppropriatenessAdminStats({
      records,
      postgresConnectivity,
    })

    return appropriatenessAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveAppropriatenessAdminActions(),
      guidance: getAppropriatenessAdminGuidance({ stats }),
    })
  }

  async executeAppropriatenessAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_appropriateness_summary'
    },
  ) {
    this.assertCanManageAppropriateness(authContext)

    const payload = appropriatenessAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_appropriateness_summary': {
        const summary = await this.getWorkspaceAppropriatenessAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return appropriatenessAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed appropriateness summary with ${summary.stats.appropriatenessPercent}% billing invoice appropriateness across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageAppropriateness(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production appropriateness tools.',
    })
  }
}
