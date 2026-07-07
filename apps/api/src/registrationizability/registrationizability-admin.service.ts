import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getRegistrationizabilityRolloutGuidance,
  registrationizabilityAdminActionRequestSchema,
  registrationizabilityAdminActionResponseSchema,
  registrationizabilityAdminSummaryResponseSchema,
  registrationizabilityCapabilitiesResponseSchema,
  registrationizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildRegistrationizabilityAdminRecords,
  buildRegistrationizabilityAdminStats,
  getRegistrationizabilityAdminGuidance,
  resolveRegistrationizabilityAdminActions,
} from './registrationizability-admin.helpers.js'
import { evaluateRegistrationizabilityRollout } from './registrationizability-rollout.helpers.js'
import { RegistrationizabilityStatusService } from './registrationizability-status.service.js'

@Injectable()
export class RegistrationizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly registrationizabilityStatusService: RegistrationizabilityStatusService,
  ) {}

  getCapabilities() {
    return registrationizabilityCapabilitiesResponseSchema.parse({
      supportsRegistrationizabilityRollout: true,
      supportsRegistrationizabilityAdminTools: true,
      supportsMeterUsageRegistrationizabilitySignals: true,
      supportsUsageEventRegistrationizabilitySignals: true,
      guidance: getRegistrationizabilityRolloutGuidance(),
    })
  }

  async getRegistrationizabilityRollout() {
    const registrationizabilityTableCoverage =
      await this.registrationizabilityStatusService.getRegistrationizabilityTableCoverage()

    const rollout = evaluateRegistrationizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.registrationizabilityStatusService.pingPostgres(),
      existingRegistrationizabilityTableCount: registrationizabilityTableCoverage.existingRegistrationizabilityTableCount,
      billingMeterUsageReportsTableExists: registrationizabilityTableCoverage.billingMeterUsageReportsTableExists,
      usageEventsTableExists: registrationizabilityTableCoverage.usageEventsTableExists,
      workspaceUsageLimitsTableExists: registrationizabilityTableCoverage.workspaceUsageLimitsTableExists,
    })

    return registrationizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceRegistrationizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageRegistrationizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.registrationizabilityStatusService.getWorkspaceRegistrationizabilityInventory(
        workspaceId,
      )
    const records = buildRegistrationizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.registrationizabilityStatusService.pingPostgres()
    const stats = buildRegistrationizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return registrationizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveRegistrationizabilityAdminActions(),
      guidance: getRegistrationizabilityAdminGuidance({ stats }),
    })
  }

  async executeRegistrationizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_registrationizability_summary'
    },
  ) {
    this.assertCanManageRegistrationizability(authContext)

    const payload = registrationizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_registrationizability_summary': {
        const summary = await this.getWorkspaceRegistrationizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return registrationizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed registrationizability summary with ${summary.stats.registrationizabilityPercent}% meter usage registrationizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageRegistrationizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production registrationizability tools.',
    })
  }
}
