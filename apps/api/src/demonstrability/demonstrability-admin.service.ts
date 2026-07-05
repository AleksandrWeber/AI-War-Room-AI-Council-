import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getDemonstrabilityRolloutGuidance,
  demonstrabilityAdminActionRequestSchema,
  demonstrabilityAdminActionResponseSchema,
  demonstrabilityAdminSummaryResponseSchema,
  demonstrabilityCapabilitiesResponseSchema,
  demonstrabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildDemonstrabilityAdminRecords,
  buildDemonstrabilityAdminStats,
  getDemonstrabilityAdminGuidance,
  resolveDemonstrabilityAdminActions,
} from './demonstrability-admin.helpers.js'
import { evaluateDemonstrabilityRollout } from './demonstrability-rollout.helpers.js'
import { DemonstrabilityStatusService } from './demonstrability-status.service.js'

@Injectable()
export class DemonstrabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly demonstrabilityStatusService: DemonstrabilityStatusService,
  ) {}

  getCapabilities() {
    return demonstrabilityCapabilitiesResponseSchema.parse({
      supportsDemonstrabilityRollout: true,
      supportsDemonstrabilityAdminTools: true,
      supportsWorkflowDemonstrabilitySignals: true,
      supportsArtifactDemonstrabilitySignals: true,
      guidance: getDemonstrabilityRolloutGuidance(),
    })
  }

  async getDemonstrabilityRollout() {
    const demonstrabilityTableCoverage =
      await this.demonstrabilityStatusService.getDemonstrabilityTableCoverage()

    const rollout = evaluateDemonstrabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.demonstrabilityStatusService.pingPostgres(),
      existingDemonstrabilityTableCount: demonstrabilityTableCoverage.existingDemonstrabilityTableCount,
      runWorkflowsTableExists: demonstrabilityTableCoverage.runWorkflowsTableExists,
      artifactsTableExists: demonstrabilityTableCoverage.artifactsTableExists,
      billingNotificationsTableExists: demonstrabilityTableCoverage.billingNotificationsTableExists,
    })

    return demonstrabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceDemonstrabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageDemonstrability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.demonstrabilityStatusService.getWorkspaceDemonstrabilityInventory(
        workspaceId,
      )
    const records = buildDemonstrabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.demonstrabilityStatusService.pingPostgres()
    const stats = buildDemonstrabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return demonstrabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveDemonstrabilityAdminActions(),
      guidance: getDemonstrabilityAdminGuidance({ stats }),
    })
  }

  async executeDemonstrabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_demonstrability_summary'
    },
  ) {
    this.assertCanManageDemonstrability(authContext)

    const payload = demonstrabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_demonstrability_summary': {
        const summary = await this.getWorkspaceDemonstrabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return demonstrabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed demonstrability summary with ${summary.stats.demonstrabilityPercent}% workflow demonstrability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageDemonstrability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production demonstrability tools.',
    })
  }
}
