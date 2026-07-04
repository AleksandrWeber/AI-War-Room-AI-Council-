import type { MockPipelineResult } from '@ai-war-room/schemas'

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
