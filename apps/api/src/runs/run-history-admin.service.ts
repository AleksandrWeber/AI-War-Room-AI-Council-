import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  criticalRunHistoryArtifactTypes,
  getRunHistoryRolloutGuidance,
  runHistoryAdminActionRequestSchema,
  runHistoryAdminActionResponseSchema,
  runHistoryAdminSummaryResponseSchema,
  runHistoryCapabilitiesResponseSchema,
  runHistoryExportResponseSchema,
  runHistoryRolloutResponseSchema,
  type AuthContext,
  type RunHistoryExportFormat,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildRunHistoryExportFilename,
  buildRunHistoryExportResponse,
  buildRunHistoryAdminStats,
  getRunHistoryAdminGuidance,
  resolveRunHistoryAdminActions,
  serializeRunHistoryCsv,
  toRunHistoryAdminRecord,
} from './run-history-admin.helpers.js'
import { evaluateRunHistoryRollout } from './run-history-rollout.helpers.js'
import { RunsService } from './runs.service.js'

@Injectable()
export class RunHistoryAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly runsService: RunsService,
  ) {}

  getCapabilities() {
    return runHistoryCapabilitiesResponseSchema.parse({
      supportsRunHistoryRollout: true,
      supportsRunHistoryAdminTools: true,
      supportsMarkdownExport: true,
      supportedArtifactTypes: [...criticalRunHistoryArtifactTypes],
      guidance: getRunHistoryRolloutGuidance(),
    })
  }

  getRunHistoryRollout() {
    const nodeEnv = this.configService.get('NODE_ENV', { infer: true })
    const rollout = evaluateRunHistoryRollout({
      nodeEnv,
      usesInMemoryRepository: nodeEnv === 'test',
      supportsMarkdownExport: true,
      supportsStreamReplay: nodeEnv !== 'test',
      supportedArtifactTypes: [...criticalRunHistoryArtifactTypes],
    })

    return runHistoryRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceRunHistoryAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageRunHistory(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const history = await this.runsService.listArtifactHistory(workspaceId)
    const allArtifacts = history.artifacts.map(toRunHistoryAdminRecord)
    const artifacts = allArtifacts.slice(-20).reverse()
    const stats = buildRunHistoryAdminStats(allArtifacts)

    return runHistoryAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      artifacts,
      stats,
      availableActions: [...resolveRunHistoryAdminActions()],
      guidance: getRunHistoryAdminGuidance({ stats }),
    })
  }

  async executeRunHistoryAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_run_history_summary'
    },
  ) {
    this.assertCanManageRunHistory(authContext)

    const payload = runHistoryAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_run_history_summary': {
        const summary = await this.getWorkspaceRunHistoryAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return runHistoryAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed run history summary with ${summary.stats.totalArtifacts} artifact(s) across ${summary.stats.uniqueRunCount} run(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  async exportWorkspaceRunHistory(
    authContext: AuthContext,
    workspaceId: string,
    format: RunHistoryExportFormat,
  ) {
    this.assertCanManageRunHistory(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    if (format !== 'csv' && format !== 'json') {
      throw new BadRequestException({
        message: 'Unsupported run history export format. Use csv or json.',
      })
    }

    const artifacts = (await this.runsService.listArtifactHistory(workspaceId))
      .artifacts.map(toRunHistoryAdminRecord)
    const exportData = buildRunHistoryExportResponse({
      workspaceId,
      artifacts,
    })
    const filename = buildRunHistoryExportFilename(workspaceId, format)

    if (format === 'json') {
      return {
        filename,
        contentType: 'application/json; charset=utf-8',
        body: runHistoryExportResponseSchema.parse(exportData),
      }
    }

    return {
      filename,
      contentType: 'text/csv; charset=utf-8',
      body: serializeRunHistoryCsv(exportData),
    }
  }

  private assertCanManageRunHistory(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message: 'Only workspace owners and admins can manage run history tools.',
    })
  }
}
