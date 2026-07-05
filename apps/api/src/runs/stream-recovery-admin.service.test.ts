import { ConfigService } from '@nestjs/config'
import { describe, expect, it } from 'vitest'
import type { ApiEnv } from '../config/env.js'
import { StreamEventBufferService } from '../persistence/stream-event-buffer.service.js'
import { StreamRecoveryAdminService } from './stream-recovery-admin.service.js'

function createConfigService(env: Partial<ApiEnv> = {}) {
  return new ConfigService<ApiEnv>({
    NODE_ENV: 'test',
    REDIS_URL: 'redis://127.0.0.1:6379',
    ...env,
  })
}

describe('StreamRecoveryAdminService', () => {
  it('reports stream replay capabilities', () => {
    const service = new StreamRecoveryAdminService(
      createConfigService(),
      new StreamEventBufferService(createConfigService()),
    )

    expect(service.getCapabilities()).toMatchObject({
      supportsStreamReplayRollout: true,
      supportsStreamRecoveryAdminTools: true,
      supportsLastEventIdReplay: true,
      streamBufferMaxLength: 100,
    })
  })

  it('reports stream replay rollout readiness', async () => {
    const service = new StreamRecoveryAdminService(
      createConfigService(),
      new StreamEventBufferService(createConfigService()),
    )

    await expect(service.getStreamReplayRollout()).resolves.toMatchObject({
      status: 'ready',
    })
  })

  it('returns workspace stream recovery admin summary for owners', async () => {
    const bufferService = new StreamEventBufferService(createConfigService())
    const service = new StreamRecoveryAdminService(
      createConfigService(),
      bufferService,
    )

    await bufferService.append({
      workspaceId: 'workspace_1',
      runId: 'run_1',
      event: {
        eventId: 'event_1',
        type: 'status',
        stepId: 'agent_pool',
        label: 'Agent pool',
        status: 'running',
        timestamp: '2026-01-01T00:00:00.000Z',
      },
    })

    await expect(
      service.getWorkspaceStreamRecoveryAdminSummary(
        {
          userId: 'user_test',
          workspaceId: 'workspace_1',
          role: 'owner',
        },
        'workspace_1',
      ),
    ).resolves.toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        bufferedRunCount: 1,
        totalBufferedEvents: 1,
      },
    })
  })

  it('rejects stream recovery admin tools for members', async () => {
    const service = new StreamRecoveryAdminService(
      createConfigService(),
      new StreamEventBufferService(createConfigService()),
    )

    await expect(
      service.getWorkspaceStreamRecoveryAdminSummary(
        {
          userId: 'user_member',
          workspaceId: 'workspace_1',
          role: 'member',
        },
        'workspace_1',
      ),
    ).rejects.toMatchObject({
      response: {
        message:
          'Only workspace owners and admins can manage stream recovery tools.',
      },
    })
  })
})
