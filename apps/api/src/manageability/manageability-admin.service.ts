import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getManageabilityRolloutGuidance,
  manageabilityAdminActionRequestSchema,
  manageabilityAdminActionResponseSchema,
  manageabilityAdminSummaryResponseSchema,
  manageabilityCapabilitiesResponseSchema,
  manageabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildManageabilityAdminRecords,
  buildManageabilityAdminStats,
  getManageabilityAdminGuidance,
  resolveManageabilityAdminActions,
} from './manageability-admin.helpers.js'
import { evaluateManageabilityRollout } from './manageability-rollout.helpers.js'
import { ManageabilityStatusService } from './manageability-status.service.js'

@Injectable()
export class ManageabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly manageabilityStatusService: ManageabilityStatusService,
  ) {}

  getCapabilities() {
    return manageabilityCapabilitiesResponseSchema.parse({
      supportsManageabilityRollout: true,
      supportsManageabilityAdminTools: true,
      supportsBillingNotificationManageabilitySignals: true,
      supportsBillingRecordManageabilitySignals: true,
      guidance: getManageabilityRolloutGuidance(),
    })
  }

  async getManageabilityRollout() {
    const manageabilityTableCoverage =
      await this.manageabilityStatusService.getManageabilityTableCoverage()

    const rollout = evaluateManageabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.manageabilityStatusService.pingPostgres(),
      existingManageabilityTableCount: manageabilityTableCoverage.existingManageabilityTableCount,
      billingNotificationsTableExists: manageabilityTableCoverage.billingNotificationsTableExists,
      billingRecordsTableExists: manageabilityTableCoverage.billingRecordsTableExists,
      idempotencyKeysTableExists: manageabilityTableCoverage.idempotencyKeysTableExists,
    })

    return manageabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceManageabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageManageability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.manageabilityStatusService.getWorkspaceManageabilityInventory(
        workspaceId,
      )
    const records = buildManageabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.manageabilityStatusService.pingPostgres()
    const stats = buildManageabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return manageabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveManageabilityAdminActions(),
      guidance: getManageabilityAdminGuidance({ stats }),
    })
  }

  async executeManageabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_manageability_summary'
    },
  ) {
    this.assertCanManageManageability(authContext)

    const payload = manageabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_manageability_summary': {
        const summary = await this.getWorkspaceManageabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return manageabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed manageability summary with ${summary.stats.manageabilityPercent}% billing notification manageability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageManageability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production manageability tools.',
    })
  }
}
