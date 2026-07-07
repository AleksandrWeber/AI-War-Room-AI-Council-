import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getProofregistryizabilityRolloutGuidance,
  proofregistryizabilityAdminActionRequestSchema,
  proofregistryizabilityAdminActionResponseSchema,
  proofregistryizabilityAdminSummaryResponseSchema,
  proofregistryizabilityCapabilitiesResponseSchema,
  proofregistryizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildProofregistryizabilityAdminRecords,
  buildProofregistryizabilityAdminStats,
  getProofregistryizabilityAdminGuidance,
  resolveProofregistryizabilityAdminActions,
} from './proofregistryizability-admin.helpers.js'
import { evaluateProofregistryizabilityRollout } from './proofregistryizability-rollout.helpers.js'
import { ProofregistryizabilityStatusService } from './proofregistryizability-status.service.js'

@Injectable()
export class ProofregistryizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly proofregistryizabilityStatusService: ProofregistryizabilityStatusService,
  ) {}

  getCapabilities() {
    return proofregistryizabilityCapabilitiesResponseSchema.parse({
      supportsProofregistryizabilityRollout: true,
      supportsProofregistryizabilityAdminTools: true,
      supportsShieldScanProofregistryizabilitySignals: true,
      supportsProviderCredentialProofregistryizabilitySignals: true,
      guidance: getProofregistryizabilityRolloutGuidance(),
    })
  }

  async getProofregistryizabilityRollout() {
    const proofregistryizabilityTableCoverage =
      await this.proofregistryizabilityStatusService.getProofregistryizabilityTableCoverage()

    const rollout = evaluateProofregistryizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.proofregistryizabilityStatusService.pingPostgres(),
      existingProofregistryizabilityTableCount: proofregistryizabilityTableCoverage.existingProofregistryizabilityTableCount,
      shieldScansTableExists: proofregistryizabilityTableCoverage.shieldScansTableExists,
      workspaceProviderCredentialsTableExists: proofregistryizabilityTableCoverage.workspaceProviderCredentialsTableExists,
      billingWebhookEventsTableExists: proofregistryizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return proofregistryizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceProofregistryizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageProofregistryizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.proofregistryizabilityStatusService.getWorkspaceProofregistryizabilityInventory(
        workspaceId,
      )
    const records = buildProofregistryizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.proofregistryizabilityStatusService.pingPostgres()
    const stats = buildProofregistryizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return proofregistryizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveProofregistryizabilityAdminActions(),
      guidance: getProofregistryizabilityAdminGuidance({ stats }),
    })
  }

  async executeProofregistryizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_proofregistryizability_summary'
    },
  ) {
    this.assertCanManageProofregistryizability(authContext)

    const payload = proofregistryizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_proofregistryizability_summary': {
        const summary = await this.getWorkspaceProofregistryizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return proofregistryizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed proofregistryizability summary with ${summary.stats.proofregistryizabilityPercent}% shield scan proofregistryizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageProofregistryizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production proofregistryizability tools.',
    })
  }
}
