import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getNomenclatizabilityRolloutGuidance,
  nomenclatizabilityAdminActionRequestSchema,
  nomenclatizabilityAdminActionResponseSchema,
  nomenclatizabilityAdminSummaryResponseSchema,
  nomenclatizabilityCapabilitiesResponseSchema,
  nomenclatizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildNomenclatizabilityAdminRecords,
  buildNomenclatizabilityAdminStats,
  getNomenclatizabilityAdminGuidance,
  resolveNomenclatizabilityAdminActions,
} from './nomenclatizability-admin.helpers.js'
import { evaluateNomenclatizabilityRollout } from './nomenclatizability-rollout.helpers.js'
import { NomenclatizabilityStatusService } from './nomenclatizability-status.service.js'

@Injectable()
export class NomenclatizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly nomenclatizabilityStatusService: NomenclatizabilityStatusService,
  ) {}

  getCapabilities() {
    return nomenclatizabilityCapabilitiesResponseSchema.parse({
      supportsNomenclatizabilityRollout: true,
      supportsNomenclatizabilityAdminTools: true,
      supportsModelHealthNomenclatizabilitySignals: true,
      supportsModelRegistryNomenclatizabilitySignals: true,
      guidance: getNomenclatizabilityRolloutGuidance(),
    })
  }

  async getNomenclatizabilityRollout() {
    const nomenclatizabilityTableCoverage =
      await this.nomenclatizabilityStatusService.getNomenclatizabilityTableCoverage()

    const rollout = evaluateNomenclatizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.nomenclatizabilityStatusService.pingPostgres(),
      existingNomenclatizabilityTableCount: nomenclatizabilityTableCoverage.existingNomenclatizabilityTableCount,
      modelHealthEventsTableExists: nomenclatizabilityTableCoverage.modelHealthEventsTableExists,
      modelRegistryEntriesTableExists: nomenclatizabilityTableCoverage.modelRegistryEntriesTableExists,
      billingRecordsTableExists: nomenclatizabilityTableCoverage.billingRecordsTableExists,
    })

    return nomenclatizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceNomenclatizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageNomenclatizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.nomenclatizabilityStatusService.getWorkspaceNomenclatizabilityInventory(
        workspaceId,
      )
    const records = buildNomenclatizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.nomenclatizabilityStatusService.pingPostgres()
    const stats = buildNomenclatizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return nomenclatizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveNomenclatizabilityAdminActions(),
      guidance: getNomenclatizabilityAdminGuidance({ stats }),
    })
  }

  async executeNomenclatizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_nomenclatizability_summary'
    },
  ) {
    this.assertCanManageNomenclatizability(authContext)

    const payload = nomenclatizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_nomenclatizability_summary': {
        const summary = await this.getWorkspaceNomenclatizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return nomenclatizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed nomenclatizability summary with ${summary.stats.nomenclatizabilityPercent}% model health nomenclatizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageNomenclatizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production nomenclatizability tools.',
    })
  }
}
