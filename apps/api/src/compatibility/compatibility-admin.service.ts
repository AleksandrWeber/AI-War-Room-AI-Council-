import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getCompatibilityRolloutGuidance,
  compatibilityAdminActionRequestSchema,
  compatibilityAdminActionResponseSchema,
  compatibilityAdminSummaryResponseSchema,
  compatibilityCapabilitiesResponseSchema,
  compatibilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildCompatibilityAdminRecords,
  buildCompatibilityAdminStats,
  getCompatibilityAdminGuidance,
  resolveCompatibilityAdminActions,
} from './compatibility-admin.helpers.js'
import { evaluateCompatibilityRollout } from './compatibility-rollout.helpers.js'
import { CompatibilityStatusService } from './compatibility-status.service.js'

@Injectable()
export class CompatibilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly compatibilityStatusService: CompatibilityStatusService,
  ) {}

  getCapabilities() {
    return compatibilityCapabilitiesResponseSchema.parse({
      supportsCompatibilityRollout: true,
      supportsCompatibilityAdminTools: true,
      supportsProviderCredentialCompatibilitySignals: true,
      supportsWorkspaceLimitCompatibilitySignals: true,
      guidance: getCompatibilityRolloutGuidance(),
    })
  }

  async getCompatibilityRollout() {
    const compatibilityTableCoverage =
      await this.compatibilityStatusService.getCompatibilityTableCoverage()

    const rollout = evaluateCompatibilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.compatibilityStatusService.pingPostgres(),
      existingCompatibilityTableCount: compatibilityTableCoverage.existingCompatibilityTableCount,
      workspaceProviderCredentialsTableExists: compatibilityTableCoverage.workspaceProviderCredentialsTableExists,
      workspaceUsageLimitsTableExists: compatibilityTableCoverage.workspaceUsageLimitsTableExists,
      billingRecordsTableExists: compatibilityTableCoverage.billingRecordsTableExists,
    })

    return compatibilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceCompatibilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageCompatibility(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.compatibilityStatusService.getWorkspaceCompatibilityInventory(
        workspaceId,
      )
    const records = buildCompatibilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.compatibilityStatusService.pingPostgres()
    const stats = buildCompatibilityAdminStats({
      records,
      postgresConnectivity,
    })

    return compatibilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveCompatibilityAdminActions(),
      guidance: getCompatibilityAdminGuidance({ stats }),
    })
  }

  async executeCompatibilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_compatibility_summary'
    },
  ) {
    this.assertCanManageCompatibility(authContext)

    const payload = compatibilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_compatibility_summary': {
        const summary = await this.getWorkspaceCompatibilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return compatibilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed compatibility summary with ${summary.stats.compatibilityPercent}% provider credential compatibility across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageCompatibility(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production compatibility tools.',
    })
  }
}
