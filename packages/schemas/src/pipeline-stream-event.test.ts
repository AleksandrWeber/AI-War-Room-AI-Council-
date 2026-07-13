import { describe, expect, it } from 'vitest'
import {
  isTerminalPipelineStreamEvent,
  type PipelineStreamEvent,
} from './pipeline-stream-event.js'

describe('pipeline stream events', () => {
  it('detects terminal pipeline and workflow status events', () => {
    const completedEvent = {
      eventId: 'event_1',
      type: 'completed',
      result: {},
      timestamp: '2026-01-01T00:00:00.000Z',
    } as PipelineStreamEvent
    const statusEvent = {
      eventId: 'event_2',
      type: 'status',
      stepId: 'agent_pool',
      label: 'Agent pool',
      status: 'running',
      timestamp: '2026-01-01T00:00:00.000Z',
    } as PipelineStreamEvent
    const failedWorkflowEvent = {
      eventId: 'event_3',
      type: 'workflow_status',
      runId: 'run_1',
      workflowId: 'workflow_1',
      taskQueue: 'ai-war-room-runs',
      status: 'failed',
      timestamp: '2026-01-01T00:00:00.000Z',
    } as PipelineStreamEvent

    expect(isTerminalPipelineStreamEvent(completedEvent)).toBe(true)
    expect(isTerminalPipelineStreamEvent(statusEvent)).toBe(false)
    expect(isTerminalPipelineStreamEvent(failedWorkflowEvent)).toBe(true)
  })
})
