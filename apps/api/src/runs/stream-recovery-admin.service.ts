import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  criticalStreamReplayEventTypes,
  getStreamReplayRolloutGuidance,
  streamRecoveryAdminActionRequestSchema,
  streamRecoveryAdminActionResponseSchema,
  streamRecoveryAdminSummaryResponseSchema,
  streamReplayCapabilitiesResponseSchema,
  streamReplayRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import { StreamEventBufferService } from '../persistence/stream-event-buffer.service.js'
import {
  buildStreamRecoveryAdminStats,
  getStreamRecoveryAdminGuidance,
  resolveStreamRecoveryAdminActions,
  toStreamRecoveryAdminRecord,
} from './stream-recovery-admin.helpers.js'
import { evaluateStreamReplayRollout } from './stream-replay-rollout.helpers.js'

@Injectable()
export class StreamRecoveryAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly streamEventBufferService: StreamEventBufferService,
  ) {}

  getCapabilities() {
    return streamReplayCapabilitiesResponseSchema.parse({
      supportsStreamReplayRollout: true,
      supportsStreamRecoveryAdminTools: true,
      supportsLastEventIdReplay: true,
      streamBufferMaxLength: this.streamEventBufferService.getStreamBufferMaxLength(),
      supportedStreamEventTypes: [...criticalStreamReplayEventTypes],
      guidance: getStreamReplayRolloutGuidance(),
    })
  }

  async getStreamReplayRollout() {
    const nodeEnv = this.configService.get('NODE_ENV', { infer: true })
    const usesRedisBackedBuffer = this.streamEventBufferService.usesRedisBackedBuffer()
    const redisConnectivity = usesRedisBackedBuffer
      ? await this.streamEventBufferService.ping()
      : true
    const rollout = evaluateStreamReplayRollout({
      nodeEnv,
      usesRedisBackedBuffer,
      redisConnectivity,
      supportsReplayAfter: true,
      supportsReplayAll: true,
      streamBufferMaxLength:
        this.streamEventBufferService.getStreamBufferMaxLength(),
      supportedStreamEventTypes: [...criticalStreamReplayEventTypes],
    })

    return streamReplayRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceStreamRecoveryAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageStreamRecovery(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const bufferedRuns = (
      await this.streamEventBufferService.listWorkspaceBufferedStreams(workspaceId)
    ).map(toStreamRecoveryAdminRecord)
    const stats = buildStreamRecoveryAdminStats(bufferedRuns)

    return streamRecoveryAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      bufferedRuns,
      stats,
      availableActions: [...resolveStreamRecoveryAdminActions({ stats })],
      guidance: getStreamRecoveryAdminGuidance({ stats }),
    })
  }

  async executeStreamRecoveryAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_stream_recovery_summary' | 'clear_workspace_stream_buffers'
    },
  ) {
    this.assertCanManageStreamRecovery(authContext)

    const payload = streamRecoveryAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_stream_recovery_summary': {
        const summary = await this.getWorkspaceStreamRecoveryAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return streamRecoveryAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed stream recovery summary with ${summary.stats.bufferedRunCount} buffered run(s) and ${summary.stats.totalBufferedEvents} event(s).`,
          stats: summary.stats,
        })
      }
      case 'clear_workspace_stream_buffers': {
        const clearedCount = await this.streamEventBufferService.clearWorkspaceStreams(
          payload.workspaceId,
        )
        const summary = await this.getWorkspaceStreamRecoveryAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return streamRecoveryAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Cleared ${clearedCount} buffered stream(s) for this workspace.`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageStreamRecovery(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage stream recovery tools.',
    })
  }
}
