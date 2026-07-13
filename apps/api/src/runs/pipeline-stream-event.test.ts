import { describe, expect, it } from 'vitest'
import {
  isTerminalPipelineStreamEvent,
  type PipelineStreamEvent,
} from './pipeline-stream-event.js'

describe('pipeline stream events re-export', () => {
  it('keeps the shared terminal helper available from the API module path', () => {
    const failedWorkflowEvent = {
      eventId: 'event_3',
      type: 'workflow_status',
      runId: 'run_1',
      workflowId: 'workflow_1',
      taskQueue: 'ai-war-room-runs',
      status: 'failed',
      timestamp: '2026-01-01T00:00:00.000Z',
    } as PipelineStreamEvent

    expect(isTerminalPipelineStreamEvent(failedWorkflowEvent)).toBe(true)
  })
})
