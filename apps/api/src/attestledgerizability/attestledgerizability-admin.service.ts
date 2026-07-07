import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getAttestledgerizabilityRolloutGuidance,
  attestledgerizabilityAdminActionRequestSchema,
  attestledgerizabilityAdminActionResponseSchema,
  attestledgerizabilityAdminSummaryResponseSchema,
  attestledgerizabilityCapabilitiesResponseSchema,
  attestledgerizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildAttestledgerizabilityAdminRecords,
  buildAttestledgerizabilityAdminStats,
  getAttestledgerizabilityAdminGuidance,
  resolveAttestledgerizabilityAdminActions,
} from './attestledgerizability-admin.helpers.js'
import { evaluateAttestledgerizabilityRollout } from './attestledgerizability-rollout.helpers.js'
import { AttestledgerizabilityStatusService } from './attestledgerizability-status.service.js'

@Injectable()
export class AttestledgerizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly attestledgerizabilityStatusService: AttestledgerizabilityStatusService,
  ) {}

  getCapabilities() {
    return attestledgerizabilityCapabilitiesResponseSchema.parse({
      supportsAttestledgerizabilityRollout: true,
      supportsAttestledgerizabilityAdminTools: true,
      supportsMembershipAttestledgerizabilitySignals: true,
      supportsUsageEventAttestledgerizabilitySignals: true,
      guidance: getAttestledgerizabilityRolloutGuidance(),
    })
  }

  async getAttestledgerizabilityRollout() {
    const attestledgerizabilityTableCoverage =
      await this.attestledgerizabilityStatusService.getAttestledgerizabilityTableCoverage()

    const rollout = evaluateAttestledgerizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.attestledgerizabilityStatusService.pingPostgres(),
      existingAttestledgerizabilityTableCount: attestledgerizabilityTableCoverage.existingAttestledgerizabilityTableCount,
      workspaceMembershipsTableExists: attestledgerizabilityTableCoverage.workspaceMembershipsTableExists,
      usageEventsTableExists: attestledgerizabilityTableCoverage.usageEventsTableExists,
      billingNotificationsTableExists: attestledgerizabilityTableCoverage.billingNotificationsTableExists,
    })

    return attestledgerizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceAttestledgerizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageAttestledgerizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.attestledgerizabilityStatusService.getWorkspaceAttestledgerizabilityInventory(
        workspaceId,
      )
    const records = buildAttestledgerizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.attestledgerizabilityStatusService.pingPostgres()
    const stats = buildAttestledgerizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return attestledgerizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveAttestledgerizabilityAdminActions(),
      guidance: getAttestledgerizabilityAdminGuidance({ stats }),
    })
  }

  async executeAttestledgerizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_attestledgerizability_summary'
    },
  ) {
    this.assertCanManageAttestledgerizability(authContext)

    const payload = attestledgerizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_attestledgerizability_summary': {
        const summary = await this.getWorkspaceAttestledgerizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return attestledgerizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed attestledgerizability summary with ${summary.stats.attestledgerizabilityPercent}% membership attestledgerizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageAttestledgerizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production attestledgerizability tools.',
    })
  }
}
