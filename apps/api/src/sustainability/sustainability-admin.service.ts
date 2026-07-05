import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getSustainabilityRolloutGuidance,
  sustainabilityAdminActionRequestSchema,
  sustainabilityAdminActionResponseSchema,
  sustainabilityAdminSummaryResponseSchema,
  sustainabilityCapabilitiesResponseSchema,
  sustainabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildSustainabilityAdminRecords,
  buildSustainabilityAdminStats,
  getSustainabilityAdminGuidance,
  resolveSustainabilityAdminActions,
} from './sustainability-admin.helpers.js'
import { evaluateSustainabilityRollout } from './sustainability-rollout.helpers.js'
import { SustainabilityStatusService } from './sustainability-status.service.js'

@Injectable()
export class SustainabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly sustainabilityStatusService: SustainabilityStatusService,
  ) {}

  getCapabilities() {
    return sustainabilityCapabilitiesResponseSchema.parse({
      supportsSustainabilityRollout: true,
      supportsSustainabilityAdminTools: true,
      supportsBillingSustainabilitySignals: true,
      supportsUsageSustainabilitySignals: true,
      guidance: getSustainabilityRolloutGuidance(),
    })
  }

  async getSustainabilityRollout() {
    const sustainabilityTableCoverage =
      await this.sustainabilityStatusService.getSustainabilityTableCoverage()

    const rollout = evaluateSustainabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity:
        await this.sustainabilityStatusService.pingPostgres(),
      existingSustainabilityTableCount:
        sustainabilityTableCoverage.existingSustainabilityTableCount,
      billingRecordsTableExists:
        sustainabilityTableCoverage.billingRecordsTableExists,
      usageEventsTableExists: sustainabilityTableCoverage.usageEventsTableExists,
      artifactsTableExists: sustainabilityTableCoverage.artifactsTableExists,
    })

    return sustainabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceSustainabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageSustainability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.sustainabilityStatusService.getWorkspaceSustainabilityInventory(
        workspaceId,
      )
    const records = buildSustainabilityAdminRecords(inventoryItems)
    const postgresConnectivity =
      await this.sustainabilityStatusService.pingPostgres()
    const stats = buildSustainabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return sustainabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveSustainabilityAdminActions(),
      guidance: getSustainabilityAdminGuidance({ stats }),
    })
  }

  async executeSustainabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_sustainability_summary'
    },
  ) {
    this.assertCanManageSustainability(authContext)

    const payload = sustainabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_sustainability_summary': {
        const summary = await this.getWorkspaceSustainabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return sustainabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed sustainability summary with ${summary.stats.sustainabilityPercent}% run sustainability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageSustainability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production sustainability tools.',
    })
  }
}
