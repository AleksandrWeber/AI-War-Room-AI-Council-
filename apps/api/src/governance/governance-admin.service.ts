import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getGovernanceRolloutGuidance,
  governanceAdminActionRequestSchema,
  governanceAdminActionResponseSchema,
  governanceAdminSummaryResponseSchema,
  governanceCapabilitiesResponseSchema,
  governanceRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildGovernanceAdminRecords,
  buildGovernanceAdminStats,
  getGovernanceAdminGuidance,
  resolveGovernanceAdminActions,
} from './governance-admin.helpers.js'
import { evaluateGovernanceRollout } from './governance-rollout.helpers.js'
import { GovernanceStatusService } from './governance-status.service.js'

@Injectable()
export class GovernanceAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly governanceStatusService: GovernanceStatusService,
  ) {}

  getCapabilities() {
    return governanceCapabilitiesResponseSchema.parse({
      supportsGovernanceRollout: true,
      supportsGovernanceAdminTools: true,
      supportsAccessGovernanceSignals: true,
      supportsCredentialGovernanceSignals: true,
      guidance: getGovernanceRolloutGuidance(),
    })
  }

  async getGovernanceRollout() {
    const governanceTableCoverage =
      await this.governanceStatusService.getGovernanceTableCoverage()

    const rollout = evaluateGovernanceRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.governanceStatusService.pingPostgres(),
      existingGovernanceTableCount:
        governanceTableCoverage.existingGovernanceTableCount,
      workspaceMembershipsTableExists:
        governanceTableCoverage.workspaceMembershipsTableExists,
      providerCredentialsTableExists:
        governanceTableCoverage.providerCredentialsTableExists,
      shieldScansTableExists: governanceTableCoverage.shieldScansTableExists,
    })

    return governanceRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceGovernanceAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageGovernance(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.governanceStatusService.getWorkspaceGovernanceInventory(
        workspaceId,
      )
    const records = buildGovernanceAdminRecords(inventoryItems)
    const postgresConnectivity =
      await this.governanceStatusService.pingPostgres()
    const stats = buildGovernanceAdminStats({
      records,
      postgresConnectivity,
    })

    return governanceAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveGovernanceAdminActions(),
      guidance: getGovernanceAdminGuidance({ stats }),
    })
  }

  async executeGovernanceAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_governance_summary'
    },
  ) {
    this.assertCanManageGovernance(authContext)

    const payload = governanceAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_governance_summary': {
        const summary = await this.getWorkspaceGovernanceAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return governanceAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed governance summary with ${summary.stats.governancePercent}% credential governance across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageGovernance(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production governance tools.',
    })
  }
}
