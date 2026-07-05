import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getAccountabilityRolloutGuidance,
  accountabilityAdminActionRequestSchema,
  accountabilityAdminActionResponseSchema,
  accountabilityAdminSummaryResponseSchema,
  accountabilityCapabilitiesResponseSchema,
  accountabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildAccountabilityAdminRecords,
  buildAccountabilityAdminStats,
  getAccountabilityAdminGuidance,
  resolveAccountabilityAdminActions,
} from './accountability-admin.helpers.js'
import { evaluateAccountabilityRollout } from './accountability-rollout.helpers.js'
import { AccountabilityStatusService } from './accountability-status.service.js'

@Injectable()
export class AccountabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly accountabilityStatusService: AccountabilityStatusService,
  ) {}

  getCapabilities() {
    return accountabilityCapabilitiesResponseSchema.parse({
      supportsAccountabilityRollout: true,
      supportsAccountabilityAdminTools: true,
      supportsIdempotencyAccountabilitySignals: true,
      supportsBillingRecordAccountabilitySignals: true,
      guidance: getAccountabilityRolloutGuidance(),
    })
  }

  async getAccountabilityRollout() {
    const accountabilityTableCoverage =
      await this.accountabilityStatusService.getAccountabilityTableCoverage()

    const rollout = evaluateAccountabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity:
        await this.accountabilityStatusService.pingPostgres(),
      existingAccountabilityTableCount:
        accountabilityTableCoverage.existingAccountabilityTableCount,
      idempotencyKeysTableExists:
        accountabilityTableCoverage.idempotencyKeysTableExists,
      billingRecordsTableExists:
        accountabilityTableCoverage.billingRecordsTableExists,
      usageEventsTableExists:
        accountabilityTableCoverage.usageEventsTableExists,
    })

    return accountabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceAccountabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageAccountability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.accountabilityStatusService.getWorkspaceAccountabilityInventory(
        workspaceId,
      )
    const records = buildAccountabilityAdminRecords(inventoryItems)
    const postgresConnectivity =
      await this.accountabilityStatusService.pingPostgres()
    const stats = buildAccountabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return accountabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveAccountabilityAdminActions(),
      guidance: getAccountabilityAdminGuidance({ stats }),
    })
  }

  async executeAccountabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_accountability_summary'
    },
  ) {
    this.assertCanManageAccountability(authContext)

    const payload = accountabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_accountability_summary': {
        const summary = await this.getWorkspaceAccountabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return accountabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed accountability summary with ${summary.stats.accountabilityPercent}% idempotency accountability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageAccountability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production accountability tools.',
    })
  }
}
