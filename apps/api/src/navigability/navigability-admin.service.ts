import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getNavigabilityRolloutGuidance,
  navigabilityAdminActionRequestSchema,
  navigabilityAdminActionResponseSchema,
  navigabilityAdminSummaryResponseSchema,
  navigabilityCapabilitiesResponseSchema,
  navigabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildNavigabilityAdminRecords,
  buildNavigabilityAdminStats,
  getNavigabilityAdminGuidance,
  resolveNavigabilityAdminActions,
} from './navigability-admin.helpers.js'
import { evaluateNavigabilityRollout } from './navigability-rollout.helpers.js'
import { NavigabilityStatusService } from './navigability-status.service.js'

@Injectable()
export class NavigabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly navigabilityStatusService: NavigabilityStatusService,
  ) {}

  getCapabilities() {
    return navigabilityCapabilitiesResponseSchema.parse({
      supportsNavigabilityRollout: true,
      supportsNavigabilityAdminTools: true,
      supportsWorkflowNavigabilitySignals: true,
      supportsSynthesisNavigabilitySignals: true,
      guidance: getNavigabilityRolloutGuidance(),
    })
  }

  async getNavigabilityRollout() {
    const navigabilityTableCoverage =
      await this.navigabilityStatusService.getNavigabilityTableCoverage()

    const rollout = evaluateNavigabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.navigabilityStatusService.pingPostgres(),
      existingNavigabilityTableCount: navigabilityTableCoverage.existingNavigabilityTableCount,
      runWorkflowsTableExists: navigabilityTableCoverage.runWorkflowsTableExists,
      moderatorSynthesesTableExists: navigabilityTableCoverage.moderatorSynthesesTableExists,
      billingInvoicesTableExists: navigabilityTableCoverage.billingInvoicesTableExists,
    })

    return navigabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceNavigabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageNavigability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.navigabilityStatusService.getWorkspaceNavigabilityInventory(
        workspaceId,
      )
    const records = buildNavigabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.navigabilityStatusService.pingPostgres()
    const stats = buildNavigabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return navigabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveNavigabilityAdminActions(),
      guidance: getNavigabilityAdminGuidance({ stats }),
    })
  }

  async executeNavigabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_navigability_summary'
    },
  ) {
    this.assertCanManageNavigability(authContext)

    const payload = navigabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_navigability_summary': {
        const summary = await this.getWorkspaceNavigabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return navigabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed navigability summary with ${summary.stats.navigabilityPercent}% workflow navigability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageNavigability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production navigability tools.',
    })
  }
}
