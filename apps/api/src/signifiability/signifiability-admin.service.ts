import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getSignifiabilityRolloutGuidance,
  signifiabilityAdminActionRequestSchema,
  signifiabilityAdminActionResponseSchema,
  signifiabilityAdminSummaryResponseSchema,
  signifiabilityCapabilitiesResponseSchema,
  signifiabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildSignifiabilityAdminRecords,
  buildSignifiabilityAdminStats,
  getSignifiabilityAdminGuidance,
  resolveSignifiabilityAdminActions,
} from './signifiability-admin.helpers.js'
import { evaluateSignifiabilityRollout } from './signifiability-rollout.helpers.js'
import { SignifiabilityStatusService } from './signifiability-status.service.js'

@Injectable()
export class SignifiabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly signifiabilityStatusService: SignifiabilityStatusService,
  ) {}

  getCapabilities() {
    return signifiabilityCapabilitiesResponseSchema.parse({
      supportsSignifiabilityRollout: true,
      supportsSignifiabilityAdminTools: true,
      supportsBillingWebhookSignifiabilitySignals: true,
      supportsBillingRecordSignifiabilitySignals: true,
      guidance: getSignifiabilityRolloutGuidance(),
    })
  }

  async getSignifiabilityRollout() {
    const signifiabilityTableCoverage =
      await this.signifiabilityStatusService.getSignifiabilityTableCoverage()

    const rollout = evaluateSignifiabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.signifiabilityStatusService.pingPostgres(),
      existingSignifiabilityTableCount: signifiabilityTableCoverage.existingSignifiabilityTableCount,
      billingWebhookEventsTableExists: signifiabilityTableCoverage.billingWebhookEventsTableExists,
      billingRecordsTableExists: signifiabilityTableCoverage.billingRecordsTableExists,
      usageEventsTableExists: signifiabilityTableCoverage.usageEventsTableExists,
    })

    return signifiabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceSignifiabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageSignifiability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.signifiabilityStatusService.getWorkspaceSignifiabilityInventory(
        workspaceId,
      )
    const records = buildSignifiabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.signifiabilityStatusService.pingPostgres()
    const stats = buildSignifiabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return signifiabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveSignifiabilityAdminActions(),
      guidance: getSignifiabilityAdminGuidance({ stats }),
    })
  }

  async executeSignifiabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_signifiability_summary'
    },
  ) {
    this.assertCanManageSignifiability(authContext)

    const payload = signifiabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_signifiability_summary': {
        const summary = await this.getWorkspaceSignifiabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return signifiabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed signifiability summary with ${summary.stats.signifiabilityPercent}% billing webhook signifiability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageSignifiability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production signifiability tools.',
    })
  }
}
