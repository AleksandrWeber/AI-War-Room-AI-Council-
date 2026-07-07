import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getAssuranceizabilityRolloutGuidance,
  assuranceizabilityAdminActionRequestSchema,
  assuranceizabilityAdminActionResponseSchema,
  assuranceizabilityAdminSummaryResponseSchema,
  assuranceizabilityCapabilitiesResponseSchema,
  assuranceizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildAssuranceizabilityAdminRecords,
  buildAssuranceizabilityAdminStats,
  getAssuranceizabilityAdminGuidance,
  resolveAssuranceizabilityAdminActions,
} from './assuranceizability-admin.helpers.js'
import { evaluateAssuranceizabilityRollout } from './assuranceizability-rollout.helpers.js'
import { AssuranceizabilityStatusService } from './assuranceizability-status.service.js'

@Injectable()
export class AssuranceizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly assuranceizabilityStatusService: AssuranceizabilityStatusService,
  ) {}

  getCapabilities() {
    return assuranceizabilityCapabilitiesResponseSchema.parse({
      supportsAssuranceizabilityRollout: true,
      supportsAssuranceizabilityAdminTools: true,
      supportsShieldScanAssuranceizabilitySignals: true,
      supportsProviderCredentialAssuranceizabilitySignals: true,
      guidance: getAssuranceizabilityRolloutGuidance(),
    })
  }

  async getAssuranceizabilityRollout() {
    const assuranceizabilityTableCoverage =
      await this.assuranceizabilityStatusService.getAssuranceizabilityTableCoverage()

    const rollout = evaluateAssuranceizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.assuranceizabilityStatusService.pingPostgres(),
      existingAssuranceizabilityTableCount: assuranceizabilityTableCoverage.existingAssuranceizabilityTableCount,
      shieldScansTableExists: assuranceizabilityTableCoverage.shieldScansTableExists,
      workspaceProviderCredentialsTableExists: assuranceizabilityTableCoverage.workspaceProviderCredentialsTableExists,
      billingWebhookEventsTableExists: assuranceizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return assuranceizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceAssuranceizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageAssuranceizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.assuranceizabilityStatusService.getWorkspaceAssuranceizabilityInventory(
        workspaceId,
      )
    const records = buildAssuranceizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.assuranceizabilityStatusService.pingPostgres()
    const stats = buildAssuranceizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return assuranceizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveAssuranceizabilityAdminActions(),
      guidance: getAssuranceizabilityAdminGuidance({ stats }),
    })
  }

  async executeAssuranceizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_assuranceizability_summary'
    },
  ) {
    this.assertCanManageAssuranceizability(authContext)

    const payload = assuranceizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_assuranceizability_summary': {
        const summary = await this.getWorkspaceAssuranceizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return assuranceizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed assuranceizability summary with ${summary.stats.assuranceizabilityPercent}% shield scan assuranceizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageAssuranceizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production assuranceizability tools.',
    })
  }
}
