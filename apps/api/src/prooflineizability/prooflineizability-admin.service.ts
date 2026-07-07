import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getProoflineizabilityRolloutGuidance,
  prooflineizabilityAdminActionRequestSchema,
  prooflineizabilityAdminActionResponseSchema,
  prooflineizabilityAdminSummaryResponseSchema,
  prooflineizabilityCapabilitiesResponseSchema,
  prooflineizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildProoflineizabilityAdminRecords,
  buildProoflineizabilityAdminStats,
  getProoflineizabilityAdminGuidance,
  resolveProoflineizabilityAdminActions,
} from './prooflineizability-admin.helpers.js'
import { evaluateProoflineizabilityRollout } from './prooflineizability-rollout.helpers.js'
import { ProoflineizabilityStatusService } from './prooflineizability-status.service.js'

@Injectable()
export class ProoflineizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly prooflineizabilityStatusService: ProoflineizabilityStatusService,
  ) {}

  getCapabilities() {
    return prooflineizabilityCapabilitiesResponseSchema.parse({
      supportsProoflineizabilityRollout: true,
      supportsProoflineizabilityAdminTools: true,
      supportsShieldScanProoflineizabilitySignals: true,
      supportsProviderCredentialProoflineizabilitySignals: true,
      guidance: getProoflineizabilityRolloutGuidance(),
    })
  }

  async getProoflineizabilityRollout() {
    const prooflineizabilityTableCoverage =
      await this.prooflineizabilityStatusService.getProoflineizabilityTableCoverage()

    const rollout = evaluateProoflineizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.prooflineizabilityStatusService.pingPostgres(),
      existingProoflineizabilityTableCount: prooflineizabilityTableCoverage.existingProoflineizabilityTableCount,
      shieldScansTableExists: prooflineizabilityTableCoverage.shieldScansTableExists,
      workspaceProviderCredentialsTableExists: prooflineizabilityTableCoverage.workspaceProviderCredentialsTableExists,
      billingWebhookEventsTableExists: prooflineizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return prooflineizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceProoflineizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageProoflineizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.prooflineizabilityStatusService.getWorkspaceProoflineizabilityInventory(
        workspaceId,
      )
    const records = buildProoflineizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.prooflineizabilityStatusService.pingPostgres()
    const stats = buildProoflineizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return prooflineizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveProoflineizabilityAdminActions(),
      guidance: getProoflineizabilityAdminGuidance({ stats }),
    })
  }

  async executeProoflineizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_prooflineizability_summary'
    },
  ) {
    this.assertCanManageProoflineizability(authContext)

    const payload = prooflineizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_prooflineizability_summary': {
        const summary = await this.getWorkspaceProoflineizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return prooflineizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed prooflineizability summary with ${summary.stats.prooflineizabilityPercent}% shield scan prooflineizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageProoflineizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production prooflineizability tools.',
    })
  }
}
