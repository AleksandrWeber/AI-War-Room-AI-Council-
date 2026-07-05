import { describe, expect, it } from 'vitest'
import type { PipelineStreamEvent } from '../runs/pipeline-stream-event.js'
import { StreamEventBufferService } from './stream-event-buffer.service.js'

function createConfigService() {
  return {
    get(key: string) {
      if (key === 'NODE_ENV') {
        return 'test'
      }

      return 'redis://127.0.0.1:6379'
    },
  } as never
}

describe('StreamEventBufferService', () => {
  it('replays all buffered events for a run', async () => {
    const service = new StreamEventBufferService(createConfigService())
    const firstEvent: PipelineStreamEvent = {
      eventId: 'event_1',
      type: 'status',
      stepId: 'agent_pool',
      label: 'Agent pool',
      status: 'running',
      timestamp: '2026-01-01T00:00:00.000Z',
    }
    const secondEvent: PipelineStreamEvent = {
      eventId: 'event_2',
      type: 'status',
      stepId: 'agent_pool',
      label: 'Agent pool',
      status: 'completed',
      timestamp: '2026-01-01T00:00:01.000Z',
    }

    await service.append({
      workspaceId: 'workspace_1',
      runId: 'run_1',
      event: firstEvent,
    })
    await service.append({
      workspaceId: 'workspace_1',
      runId: 'run_1',
      event: secondEvent,
    })

    await expect(
      service.replayAll({
        workspaceId: 'workspace_1',
        runId: 'run_1',
      }),
    ).resolves.toEqual([
      expect.objectContaining({ type: 'status', stepId: 'agent_pool', status: 'running' }),
      expect.objectContaining({ type: 'status', stepId: 'agent_pool', status: 'completed' }),
    ])
  })

  it('lists and clears workspace buffered streams', async () => {
    const service = new StreamEventBufferService(createConfigService())
    const event: PipelineStreamEvent = {
      eventId: 'event_1',
      type: 'status',
      stepId: 'agent_pool',
      label: 'Agent pool',
      status: 'running',
      timestamp: '2026-01-01T00:00:00.000Z',
    }

    await service.append({
      workspaceId: 'workspace_1',
      runId: 'run_1',
      event,
    })

    await expect(
      service.listWorkspaceBufferedStreams('workspace_1'),
    ).resolves.toEqual([
      expect.objectContaining({
        runId: 'run_1',
        eventCount: 1,
      }),
    ])

    await expect(service.clearWorkspaceStreams('workspace_1')).resolves.toBe(1)
    await expect(
      service.listWorkspaceBufferedStreams('workspace_1'),
    ).resolves.toEqual([])
  })
})
