import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getSemiotizabilityRolloutGuidance,
  semiotizabilityAdminActionRequestSchema,
  semiotizabilityAdminActionResponseSchema,
  semiotizabilityAdminSummaryResponseSchema,
  semiotizabilityCapabilitiesResponseSchema,
  semiotizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildSemiotizabilityAdminRecords,
  buildSemiotizabilityAdminStats,
  getSemiotizabilityAdminGuidance,
  resolveSemiotizabilityAdminActions,
} from './semiotizability-admin.helpers.js'
import { evaluateSemiotizabilityRollout } from './semiotizability-rollout.helpers.js'
import { SemiotizabilityStatusService } from './semiotizability-status.service.js'

@Injectable()
export class SemiotizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly semiotizabilityStatusService: SemiotizabilityStatusService,
  ) {}

  getCapabilities() {
    return semiotizabilityCapabilitiesResponseSchema.parse({
      supportsSemiotizabilityRollout: true,
      supportsSemiotizabilityAdminTools: true,
      supportsShieldScanSemiotizabilitySignals: true,
      supportsProviderCredentialSemiotizabilitySignals: true,
      guidance: getSemiotizabilityRolloutGuidance(),
    })
  }

  async getSemiotizabilityRollout() {
    const semiotizabilityTableCoverage =
      await this.semiotizabilityStatusService.getSemiotizabilityTableCoverage()

    const rollout = evaluateSemiotizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.semiotizabilityStatusService.pingPostgres(),
      existingSemiotizabilityTableCount: semiotizabilityTableCoverage.existingSemiotizabilityTableCount,
      shieldScansTableExists: semiotizabilityTableCoverage.shieldScansTableExists,
      workspaceProviderCredentialsTableExists: semiotizabilityTableCoverage.workspaceProviderCredentialsTableExists,
      billingWebhookEventsTableExists: semiotizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return semiotizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceSemiotizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageSemiotizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.semiotizabilityStatusService.getWorkspaceSemiotizabilityInventory(
        workspaceId,
      )
    const records = buildSemiotizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.semiotizabilityStatusService.pingPostgres()
    const stats = buildSemiotizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return semiotizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveSemiotizabilityAdminActions(),
      guidance: getSemiotizabilityAdminGuidance({ stats }),
    })
  }

  async executeSemiotizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_semiotizability_summary'
    },
  ) {
    this.assertCanManageSemiotizability(authContext)

    const payload = semiotizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_semiotizability_summary': {
        const summary = await this.getWorkspaceSemiotizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return semiotizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed semiotizability summary with ${summary.stats.semiotizabilityPercent}% shield scan semiotizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageSemiotizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production semiotizability tools.',
    })
  }
}
