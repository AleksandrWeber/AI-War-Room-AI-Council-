import type { MockPipelineResult, TemporalWorkflowStatus } from '@ai-war-room/schemas'
import { isTemporalTerminalStatus } from '@ai-war-room/schemas'

export type PipelineStreamEvent =
  | {
      eventId: string
      type: 'status'
      stepId: string
      label: string
      status: 'running' | 'completed'
      timestamp: string
    }
  | {
      eventId: string
      type: 'artifact'
      artifactType: MockPipelineResult['artifacts'][number]['metadata']['artifactType']
      artifact: MockPipelineResult['artifacts'][number]
      timestamp: string
    }
  | {
      eventId: string
      type: 'completed'
      result: MockPipelineResult
      timestamp: string
    }
  | {
      eventId: string
      type: 'error'
      message: string
      timestamp: string
    }
  | {
      eventId: string
      type: 'workflow_status'
      runId: string
      workflowId: string
      temporalRunId?: string
      taskQueue: string
      status: TemporalWorkflowStatus
      timestamp: string
    }

export function isTerminalPipelineStreamEvent(event: PipelineStreamEvent) {
  if (event.type === 'completed' || event.type === 'error') {
    return true
  }

  if (event.type === 'workflow_status') {
    return isTemporalTerminalStatus(event.status)
  }

  return false
}
