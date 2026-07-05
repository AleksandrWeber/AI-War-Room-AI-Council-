import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getFormalizabilityRolloutGuidance,
  formalizabilityAdminActionRequestSchema,
  formalizabilityAdminActionResponseSchema,
  formalizabilityAdminSummaryResponseSchema,
  formalizabilityCapabilitiesResponseSchema,
  formalizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildFormalizabilityAdminRecords,
  buildFormalizabilityAdminStats,
  getFormalizabilityAdminGuidance,
  resolveFormalizabilityAdminActions,
} from './formalizability-admin.helpers.js'
import { evaluateFormalizabilityRollout } from './formalizability-rollout.helpers.js'
import { FormalizabilityStatusService } from './formalizability-status.service.js'

@Injectable()
export class FormalizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly formalizabilityStatusService: FormalizabilityStatusService,
  ) {}

  getCapabilities() {
    return formalizabilityCapabilitiesResponseSchema.parse({
      supportsFormalizabilityRollout: true,
      supportsFormalizabilityAdminTools: true,
      supportsProviderCredentialFormalizabilitySignals: true,
      supportsModelRegistryFormalizabilitySignals: true,
      guidance: getFormalizabilityRolloutGuidance(),
    })
  }

  async getFormalizabilityRollout() {
    const formalizabilityTableCoverage =
      await this.formalizabilityStatusService.getFormalizabilityTableCoverage()

    const rollout = evaluateFormalizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.formalizabilityStatusService.pingPostgres(),
      existingFormalizabilityTableCount: formalizabilityTableCoverage.existingFormalizabilityTableCount,
      workspaceProviderCredentialsTableExists: formalizabilityTableCoverage.workspaceProviderCredentialsTableExists,
      modelRegistryEntriesTableExists: formalizabilityTableCoverage.modelRegistryEntriesTableExists,
      billingWebhookEventsTableExists: formalizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return formalizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceFormalizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageFormalizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.formalizabilityStatusService.getWorkspaceFormalizabilityInventory(
        workspaceId,
      )
    const records = buildFormalizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.formalizabilityStatusService.pingPostgres()
    const stats = buildFormalizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return formalizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveFormalizabilityAdminActions(),
      guidance: getFormalizabilityAdminGuidance({ stats }),
    })
  }

  async executeFormalizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_formalizability_summary'
    },
  ) {
    this.assertCanManageFormalizability(authContext)

    const payload = formalizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_formalizability_summary': {
        const summary = await this.getWorkspaceFormalizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return formalizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed formalizability summary with ${summary.stats.formalizabilityPercent}% provider credential formalizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageFormalizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production formalizability tools.',
    })
  }
}
