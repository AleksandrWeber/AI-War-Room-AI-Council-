import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getProgrammabilityvaultizabilityRolloutGuidance,
  programmabilityvaultizabilityAdminActionRequestSchema,
  programmabilityvaultizabilityAdminActionResponseSchema,
  programmabilityvaultizabilityAdminSummaryResponseSchema,
  programmabilityvaultizabilityCapabilitiesResponseSchema,
  programmabilityvaultizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildProgrammabilityvaultizabilityAdminRecords,
  buildProgrammabilityvaultizabilityAdminStats,
  getProgrammabilityvaultizabilityAdminGuidance,
  resolveProgrammabilityvaultizabilityAdminActions,
} from './programmabilityvaultizability-admin.helpers.js'
import { evaluateProgrammabilityvaultizabilityRollout } from './programmabilityvaultizability-rollout.helpers.js'
import { ProgrammabilityvaultizabilityStatusService } from './programmabilityvaultizability-status.service.js'

@Injectable()
export class ProgrammabilityvaultizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly programmabilityvaultizabilityStatusService: ProgrammabilityvaultizabilityStatusService,
  ) {}

  getCapabilities() {
    return programmabilityvaultizabilityCapabilitiesResponseSchema.parse({
      supportsProgrammabilityvaultizabilityRollout: true,
      supportsProgrammabilityvaultizabilityAdminTools: true,
      supportsBillingInvoiceProgrammabilityvaultizabilitySignals: true,
      supportsBillingRecordProgrammabilityvaultizabilitySignals: true,
      guidance: getProgrammabilityvaultizabilityRolloutGuidance(),
    })
  }

  async getProgrammabilityvaultizabilityRollout() {
    const programmabilityvaultizabilityTableCoverage =
      await this.programmabilityvaultizabilityStatusService.getProgrammabilityvaultizabilityTableCoverage()

    const rollout = evaluateProgrammabilityvaultizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.programmabilityvaultizabilityStatusService.pingPostgres(),
      existingProgrammabilityvaultizabilityTableCount: programmabilityvaultizabilityTableCoverage.existingProgrammabilityvaultizabilityTableCount,
      billingInvoicesTableExists: programmabilityvaultizabilityTableCoverage.billingInvoicesTableExists,
      billingRecordsTableExists: programmabilityvaultizabilityTableCoverage.billingRecordsTableExists,
      billingWebhookEventsTableExists: programmabilityvaultizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return programmabilityvaultizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceProgrammabilityvaultizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageProgrammabilityvaultizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.programmabilityvaultizabilityStatusService.getWorkspaceProgrammabilityvaultizabilityInventory(
        workspaceId,
      )
    const records = buildProgrammabilityvaultizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.programmabilityvaultizabilityStatusService.pingPostgres()
    const stats = buildProgrammabilityvaultizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return programmabilityvaultizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveProgrammabilityvaultizabilityAdminActions(),
      guidance: getProgrammabilityvaultizabilityAdminGuidance({ stats }),
    })
  }

  async executeProgrammabilityvaultizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_programmabilityvaultizability_summary'
    },
  ) {
    this.assertCanManageProgrammabilityvaultizability(authContext)

    const payload = programmabilityvaultizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_programmabilityvaultizability_summary': {
        const summary = await this.getWorkspaceProgrammabilityvaultizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return programmabilityvaultizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed programmabilityvaultizability summary with ${summary.stats.programmabilityvaultizabilityPercent}% billing invoice programmabilityvaultizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageProgrammabilityvaultizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production programmabilityvaultizability tools.',
    })
  }
}
