import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getSandboxizabilityRolloutGuidance,
  sandboxizabilityAdminActionRequestSchema,
  sandboxizabilityAdminActionResponseSchema,
  sandboxizabilityAdminSummaryResponseSchema,
  sandboxizabilityCapabilitiesResponseSchema,
  sandboxizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildSandboxizabilityAdminRecords,
  buildSandboxizabilityAdminStats,
  getSandboxizabilityAdminGuidance,
  resolveSandboxizabilityAdminActions,
} from './sandboxizability-admin.helpers.js'
import { evaluateSandboxizabilityRollout } from './sandboxizability-rollout.helpers.js'
import { SandboxizabilityStatusService } from './sandboxizability-status.service.js'

@Injectable()
export class SandboxizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly sandboxizabilityStatusService: SandboxizabilityStatusService,
  ) {}

  getCapabilities() {
    return sandboxizabilityCapabilitiesResponseSchema.parse({
      supportsSandboxizabilityRollout: true,
      supportsSandboxizabilityAdminTools: true,
      supportsMembershipSandboxizabilitySignals: true,
      supportsUsageEventSandboxizabilitySignals: true,
      guidance: getSandboxizabilityRolloutGuidance(),
    })
  }

  async getSandboxizabilityRollout() {
    const sandboxizabilityTableCoverage =
      await this.sandboxizabilityStatusService.getSandboxizabilityTableCoverage()

    const rollout = evaluateSandboxizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.sandboxizabilityStatusService.pingPostgres(),
      existingSandboxizabilityTableCount: sandboxizabilityTableCoverage.existingSandboxizabilityTableCount,
      workspaceMembershipsTableExists: sandboxizabilityTableCoverage.workspaceMembershipsTableExists,
      usageEventsTableExists: sandboxizabilityTableCoverage.usageEventsTableExists,
      billingNotificationsTableExists: sandboxizabilityTableCoverage.billingNotificationsTableExists,
    })

    return sandboxizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceSandboxizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageSandboxizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.sandboxizabilityStatusService.getWorkspaceSandboxizabilityInventory(
        workspaceId,
      )
    const records = buildSandboxizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.sandboxizabilityStatusService.pingPostgres()
    const stats = buildSandboxizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return sandboxizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveSandboxizabilityAdminActions(),
      guidance: getSandboxizabilityAdminGuidance({ stats }),
    })
  }

  async executeSandboxizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_sandboxizability_summary'
    },
  ) {
    this.assertCanManageSandboxizability(authContext)

    const payload = sandboxizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_sandboxizability_summary': {
        const summary = await this.getWorkspaceSandboxizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return sandboxizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed sandboxizability summary with ${summary.stats.sandboxizabilityPercent}% membership sandboxizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageSandboxizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production sandboxizability tools.',
    })
  }
}
