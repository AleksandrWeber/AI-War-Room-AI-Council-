import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getAttesttrackizabilityRolloutGuidance,
  attesttrackizabilityAdminActionRequestSchema,
  attesttrackizabilityAdminActionResponseSchema,
  attesttrackizabilityAdminSummaryResponseSchema,
  attesttrackizabilityCapabilitiesResponseSchema,
  attesttrackizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildAttesttrackizabilityAdminRecords,
  buildAttesttrackizabilityAdminStats,
  getAttesttrackizabilityAdminGuidance,
  resolveAttesttrackizabilityAdminActions,
} from './attesttrackizability-admin.helpers.js'
import { evaluateAttesttrackizabilityRollout } from './attesttrackizability-rollout.helpers.js'
import { AttesttrackizabilityStatusService } from './attesttrackizability-status.service.js'

@Injectable()
export class AttesttrackizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly attesttrackizabilityStatusService: AttesttrackizabilityStatusService,
  ) {}

  getCapabilities() {
    return attesttrackizabilityCapabilitiesResponseSchema.parse({
      supportsAttesttrackizabilityRollout: true,
      supportsAttesttrackizabilityAdminTools: true,
      supportsMembershipAttesttrackizabilitySignals: true,
      supportsUsageEventAttesttrackizabilitySignals: true,
      guidance: getAttesttrackizabilityRolloutGuidance(),
    })
  }

  async getAttesttrackizabilityRollout() {
    const attesttrackizabilityTableCoverage =
      await this.attesttrackizabilityStatusService.getAttesttrackizabilityTableCoverage()

    const rollout = evaluateAttesttrackizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.attesttrackizabilityStatusService.pingPostgres(),
      existingAttesttrackizabilityTableCount: attesttrackizabilityTableCoverage.existingAttesttrackizabilityTableCount,
      workspaceMembershipsTableExists: attesttrackizabilityTableCoverage.workspaceMembershipsTableExists,
      usageEventsTableExists: attesttrackizabilityTableCoverage.usageEventsTableExists,
      billingNotificationsTableExists: attesttrackizabilityTableCoverage.billingNotificationsTableExists,
    })

    return attesttrackizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceAttesttrackizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageAttesttrackizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.attesttrackizabilityStatusService.getWorkspaceAttesttrackizabilityInventory(
        workspaceId,
      )
    const records = buildAttesttrackizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.attesttrackizabilityStatusService.pingPostgres()
    const stats = buildAttesttrackizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return attesttrackizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveAttesttrackizabilityAdminActions(),
      guidance: getAttesttrackizabilityAdminGuidance({ stats }),
    })
  }

  async executeAttesttrackizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_attesttrackizability_summary'
    },
  ) {
    this.assertCanManageAttesttrackizability(authContext)

    const payload = attesttrackizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_attesttrackizability_summary': {
        const summary = await this.getWorkspaceAttesttrackizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return attesttrackizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed attesttrackizability summary with ${summary.stats.attesttrackizabilityPercent}% membership attesttrackizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageAttesttrackizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production attesttrackizability tools.',
    })
  }
}
