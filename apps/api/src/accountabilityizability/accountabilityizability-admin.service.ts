import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getAccountabilityizabilityRolloutGuidance,
  accountabilityizabilityAdminActionRequestSchema,
  accountabilityizabilityAdminActionResponseSchema,
  accountabilityizabilityAdminSummaryResponseSchema,
  accountabilityizabilityCapabilitiesResponseSchema,
  accountabilityizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildAccountabilityizabilityAdminRecords,
  buildAccountabilityizabilityAdminStats,
  getAccountabilityizabilityAdminGuidance,
  resolveAccountabilityizabilityAdminActions,
} from './accountabilityizability-admin.helpers.js'
import { evaluateAccountabilityizabilityRollout } from './accountabilityizability-rollout.helpers.js'
import { AccountabilityizabilityStatusService } from './accountabilityizability-status.service.js'

@Injectable()
export class AccountabilityizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly accountabilityizabilityStatusService: AccountabilityizabilityStatusService,
  ) {}

  getCapabilities() {
    return accountabilityizabilityCapabilitiesResponseSchema.parse({
      supportsAccountabilityizabilityRollout: true,
      supportsAccountabilityizabilityAdminTools: true,
      supportsMembershipAccountabilityizabilitySignals: true,
      supportsUsageEventAccountabilityizabilitySignals: true,
      guidance: getAccountabilityizabilityRolloutGuidance(),
    })
  }

  async getAccountabilityizabilityRollout() {
    const accountabilityizabilityTableCoverage =
      await this.accountabilityizabilityStatusService.getAccountabilityizabilityTableCoverage()

    const rollout = evaluateAccountabilityizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.accountabilityizabilityStatusService.pingPostgres(),
      existingAccountabilityizabilityTableCount: accountabilityizabilityTableCoverage.existingAccountabilityizabilityTableCount,
      workspaceMembershipsTableExists: accountabilityizabilityTableCoverage.workspaceMembershipsTableExists,
      usageEventsTableExists: accountabilityizabilityTableCoverage.usageEventsTableExists,
      billingNotificationsTableExists: accountabilityizabilityTableCoverage.billingNotificationsTableExists,
    })

    return accountabilityizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceAccountabilityizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageAccountabilityizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.accountabilityizabilityStatusService.getWorkspaceAccountabilityizabilityInventory(
        workspaceId,
      )
    const records = buildAccountabilityizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.accountabilityizabilityStatusService.pingPostgres()
    const stats = buildAccountabilityizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return accountabilityizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveAccountabilityizabilityAdminActions(),
      guidance: getAccountabilityizabilityAdminGuidance({ stats }),
    })
  }

  async executeAccountabilityizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_accountabilityizability_summary'
    },
  ) {
    this.assertCanManageAccountabilityizability(authContext)

    const payload = accountabilityizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_accountabilityizability_summary': {
        const summary = await this.getWorkspaceAccountabilityizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return accountabilityizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed accountabilityizability summary with ${summary.stats.accountabilityizabilityPercent}% membership accountabilityizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageAccountabilityizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production accountabilityizability tools.',
    })
  }
}
