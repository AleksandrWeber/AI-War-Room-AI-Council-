import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getPatchizabilityRolloutGuidance,
  patchizabilityAdminActionRequestSchema,
  patchizabilityAdminActionResponseSchema,
  patchizabilityAdminSummaryResponseSchema,
  patchizabilityCapabilitiesResponseSchema,
  patchizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildPatchizabilityAdminRecords,
  buildPatchizabilityAdminStats,
  getPatchizabilityAdminGuidance,
  resolvePatchizabilityAdminActions,
} from './patchizability-admin.helpers.js'
import { evaluatePatchizabilityRollout } from './patchizability-rollout.helpers.js'
import { PatchizabilityStatusService } from './patchizability-status.service.js'

@Injectable()
export class PatchizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly patchizabilityStatusService: PatchizabilityStatusService,
  ) {}

  getCapabilities() {
    return patchizabilityCapabilitiesResponseSchema.parse({
      supportsPatchizabilityRollout: true,
      supportsPatchizabilityAdminTools: true,
      supportsModelHealthPatchizabilitySignals: true,
      supportsModelRegistryPatchizabilitySignals: true,
      guidance: getPatchizabilityRolloutGuidance(),
    })
  }

  async getPatchizabilityRollout() {
    const patchizabilityTableCoverage =
      await this.patchizabilityStatusService.getPatchizabilityTableCoverage()

    const rollout = evaluatePatchizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.patchizabilityStatusService.pingPostgres(),
      existingPatchizabilityTableCount: patchizabilityTableCoverage.existingPatchizabilityTableCount,
      modelHealthEventsTableExists: patchizabilityTableCoverage.modelHealthEventsTableExists,
      modelRegistryEntriesTableExists: patchizabilityTableCoverage.modelRegistryEntriesTableExists,
      billingRecordsTableExists: patchizabilityTableCoverage.billingRecordsTableExists,
    })

    return patchizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspacePatchizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManagePatchizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.patchizabilityStatusService.getWorkspacePatchizabilityInventory(
        workspaceId,
      )
    const records = buildPatchizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.patchizabilityStatusService.pingPostgres()
    const stats = buildPatchizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return patchizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolvePatchizabilityAdminActions(),
      guidance: getPatchizabilityAdminGuidance({ stats }),
    })
  }

  async executePatchizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_patchizability_summary'
    },
  ) {
    this.assertCanManagePatchizability(authContext)

    const payload = patchizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_patchizability_summary': {
        const summary = await this.getWorkspacePatchizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return patchizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed patchizability summary with ${summary.stats.patchizabilityPercent}% model health patchizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManagePatchizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production patchizability tools.',
    })
  }
}
