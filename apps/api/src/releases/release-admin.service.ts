import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getReleaseRolloutGuidance,
  releaseAdminActionRequestSchema,
  releaseAdminActionResponseSchema,
  releaseAdminSummaryResponseSchema,
  releaseCapabilitiesResponseSchema,
  releaseRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import { MigrationStatusService } from '../migrations/migration-status.service.js'
import {
  buildReleaseAdminRecords,
  buildReleaseAdminStats,
  getReleaseAdminGuidance,
  resolveReleaseAdminActions,
} from './release-admin.helpers.js'
import {
  API_VERSION,
  evaluateReleaseRollout,
} from './release-rollout.helpers.js'
import { ReleaseStatusService } from './release-status.service.js'

@Injectable()
export class ReleaseAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly releaseStatusService: ReleaseStatusService,
    private readonly migrationStatusService: MigrationStatusService,
  ) {}

  getCapabilities() {
    return releaseCapabilitiesResponseSchema.parse({
      supportsReleaseRollout: true,
      supportsReleaseAdminTools: true,
      supportsApiVersionMetadata: true,
      supportsReleaseArtifactTables: true,
      guidance: getReleaseRolloutGuidance(),
    })
  }

  async getReleaseRollout() {
    const releaseTableCoverage =
      await this.releaseStatusService.getReleaseTableCoverage()
    const inventory = await this.migrationStatusService.getMigrationInventory()
    const rollout = evaluateReleaseRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.releaseStatusService.pingPostgres(),
      existingReleaseTableCount: releaseTableCoverage.existingReleaseTableCount,
      apiVersionMetadataAvailable: true,
      pendingMigrationCount: inventory.pendingVersions.length,
    })

    return releaseRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceReleaseAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageRelease(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventory =
      await this.releaseStatusService.getWorkspaceReleaseInventory(workspaceId)
    const records = buildReleaseAdminRecords(inventory)
    const postgresConnectivity = await this.releaseStatusService.pingPostgres()
    const stats = buildReleaseAdminStats({
      records,
      postgresConnectivity,
      apiVersion: API_VERSION,
    })

    return releaseAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveReleaseAdminActions(),
      guidance: getReleaseAdminGuidance({ stats }),
    })
  }

  async executeReleaseAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_release_summary'
    },
  ) {
    this.assertCanManageRelease(authContext)

    const payload = releaseAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_release_summary': {
        const summary = await this.getWorkspaceReleaseAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return releaseAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed release summary with ${summary.stats.totalRecords} release record(s) across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageRelease(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production release tools.',
    })
  }
}
