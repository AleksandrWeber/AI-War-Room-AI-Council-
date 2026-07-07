import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getDependabilityvaultizabilityRolloutGuidance,
  dependabilityvaultizabilityAdminActionRequestSchema,
  dependabilityvaultizabilityAdminActionResponseSchema,
  dependabilityvaultizabilityAdminSummaryResponseSchema,
  dependabilityvaultizabilityCapabilitiesResponseSchema,
  dependabilityvaultizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildDependabilityvaultizabilityAdminRecords,
  buildDependabilityvaultizabilityAdminStats,
  getDependabilityvaultizabilityAdminGuidance,
  resolveDependabilityvaultizabilityAdminActions,
} from './dependabilityvaultizability-admin.helpers.js'
import { evaluateDependabilityvaultizabilityRollout } from './dependabilityvaultizability-rollout.helpers.js'
import { DependabilityvaultizabilityStatusService } from './dependabilityvaultizability-status.service.js'

@Injectable()
export class DependabilityvaultizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly dependabilityvaultizabilityStatusService: DependabilityvaultizabilityStatusService,
  ) {}

  getCapabilities() {
    return dependabilityvaultizabilityCapabilitiesResponseSchema.parse({
      supportsDependabilityvaultizabilityRollout: true,
      supportsDependabilityvaultizabilityAdminTools: true,
      supportsIdempotencyKeyDependabilityvaultizabilitySignals: true,
      supportsUsageEventDependabilityvaultizabilitySignals: true,
      guidance: getDependabilityvaultizabilityRolloutGuidance(),
    })
  }

  async getDependabilityvaultizabilityRollout() {
    const dependabilityvaultizabilityTableCoverage =
      await this.dependabilityvaultizabilityStatusService.getDependabilityvaultizabilityTableCoverage()

    const rollout = evaluateDependabilityvaultizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.dependabilityvaultizabilityStatusService.pingPostgres(),
      existingDependabilityvaultizabilityTableCount: dependabilityvaultizabilityTableCoverage.existingDependabilityvaultizabilityTableCount,
      idempotencyKeysTableExists: dependabilityvaultizabilityTableCoverage.idempotencyKeysTableExists,
      usageEventsTableExists: dependabilityvaultizabilityTableCoverage.usageEventsTableExists,
      billingWebhookEventsTableExists: dependabilityvaultizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return dependabilityvaultizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceDependabilityvaultizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageDependabilityvaultizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.dependabilityvaultizabilityStatusService.getWorkspaceDependabilityvaultizabilityInventory(
        workspaceId,
      )
    const records = buildDependabilityvaultizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.dependabilityvaultizabilityStatusService.pingPostgres()
    const stats = buildDependabilityvaultizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return dependabilityvaultizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveDependabilityvaultizabilityAdminActions(),
      guidance: getDependabilityvaultizabilityAdminGuidance({ stats }),
    })
  }

  async executeDependabilityvaultizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_dependabilityvaultizability_summary'
    },
  ) {
    this.assertCanManageDependabilityvaultizability(authContext)

    const payload = dependabilityvaultizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_dependabilityvaultizability_summary': {
        const summary = await this.getWorkspaceDependabilityvaultizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return dependabilityvaultizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed dependabilityvaultizability summary with ${summary.stats.dependabilityvaultizabilityPercent}% idempotency key dependabilityvaultizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageDependabilityvaultizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production dependabilityvaultizability tools.',
    })
  }
}
