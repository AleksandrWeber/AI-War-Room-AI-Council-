import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getDependabilityRolloutGuidance,
  dependabilityAdminActionRequestSchema,
  dependabilityAdminActionResponseSchema,
  dependabilityAdminSummaryResponseSchema,
  dependabilityCapabilitiesResponseSchema,
  dependabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildDependabilityAdminRecords,
  buildDependabilityAdminStats,
  getDependabilityAdminGuidance,
  resolveDependabilityAdminActions,
} from './dependability-admin.helpers.js'
import { evaluateDependabilityRollout } from './dependability-rollout.helpers.js'
import { DependabilityStatusService } from './dependability-status.service.js'

@Injectable()
export class DependabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly dependabilityStatusService: DependabilityStatusService,
  ) {}

  getCapabilities() {
    return dependabilityCapabilitiesResponseSchema.parse({
      supportsDependabilityRollout: true,
      supportsDependabilityAdminTools: true,
      supportsBillingRecordDependabilitySignals: true,
      supportsBillingInvoiceDependabilitySignals: true,
      guidance: getDependabilityRolloutGuidance(),
    })
  }

  async getDependabilityRollout() {
    const dependabilityTableCoverage =
      await this.dependabilityStatusService.getDependabilityTableCoverage()

    const rollout = evaluateDependabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.dependabilityStatusService.pingPostgres(),
      existingDependabilityTableCount: dependabilityTableCoverage.existingDependabilityTableCount,
      billingRecordsTableExists: dependabilityTableCoverage.billingRecordsTableExists,
      billingInvoicesTableExists: dependabilityTableCoverage.billingInvoicesTableExists,
      billingNotificationsTableExists: dependabilityTableCoverage.billingNotificationsTableExists,
    })

    return dependabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceDependabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageDependability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.dependabilityStatusService.getWorkspaceDependabilityInventory(
        workspaceId,
      )
    const records = buildDependabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.dependabilityStatusService.pingPostgres()
    const stats = buildDependabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return dependabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveDependabilityAdminActions(),
      guidance: getDependabilityAdminGuidance({ stats }),
    })
  }

  async executeDependabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_dependability_summary'
    },
  ) {
    this.assertCanManageDependability(authContext)

    const payload = dependabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_dependability_summary': {
        const summary = await this.getWorkspaceDependabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return dependabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed dependability summary with ${summary.stats.dependabilityPercent}% billing record dependability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageDependability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production dependability tools.',
    })
  }
}
