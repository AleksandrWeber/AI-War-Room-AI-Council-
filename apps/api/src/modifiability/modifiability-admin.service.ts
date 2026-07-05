import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getModifiabilityRolloutGuidance,
  modifiabilityAdminActionRequestSchema,
  modifiabilityAdminActionResponseSchema,
  modifiabilityAdminSummaryResponseSchema,
  modifiabilityCapabilitiesResponseSchema,
  modifiabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildModifiabilityAdminRecords,
  buildModifiabilityAdminStats,
  getModifiabilityAdminGuidance,
  resolveModifiabilityAdminActions,
} from './modifiability-admin.helpers.js'
import { evaluateModifiabilityRollout } from './modifiability-rollout.helpers.js'
import { ModifiabilityStatusService } from './modifiability-status.service.js'

@Injectable()
export class ModifiabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly modifiabilityStatusService: ModifiabilityStatusService,
  ) {}

  getCapabilities() {
    return modifiabilityCapabilitiesResponseSchema.parse({
      supportsModifiabilityRollout: true,
      supportsModifiabilityAdminTools: true,
      supportsIdempotencyKeyModifiabilitySignals: true,
      supportsBillingRecordModifiabilitySignals: true,
      guidance: getModifiabilityRolloutGuidance(),
    })
  }

  async getModifiabilityRollout() {
    const modifiabilityTableCoverage =
      await this.modifiabilityStatusService.getModifiabilityTableCoverage()

    const rollout = evaluateModifiabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.modifiabilityStatusService.pingPostgres(),
      existingModifiabilityTableCount: modifiabilityTableCoverage.existingModifiabilityTableCount,
      idempotencyKeysTableExists: modifiabilityTableCoverage.idempotencyKeysTableExists,
      billingRecordsTableExists: modifiabilityTableCoverage.billingRecordsTableExists,
      workspaceMembershipsTableExists: modifiabilityTableCoverage.workspaceMembershipsTableExists,
    })

    return modifiabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceModifiabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageModifiability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.modifiabilityStatusService.getWorkspaceModifiabilityInventory(
        workspaceId,
      )
    const records = buildModifiabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.modifiabilityStatusService.pingPostgres()
    const stats = buildModifiabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return modifiabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveModifiabilityAdminActions(),
      guidance: getModifiabilityAdminGuidance({ stats }),
    })
  }

  async executeModifiabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_modifiability_summary'
    },
  ) {
    this.assertCanManageModifiability(authContext)

    const payload = modifiabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_modifiability_summary': {
        const summary = await this.getWorkspaceModifiabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return modifiabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed modifiability summary with ${summary.stats.modifiabilityPercent}% idempotency key modifiability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageModifiability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production modifiability tools.',
    })
  }
}
