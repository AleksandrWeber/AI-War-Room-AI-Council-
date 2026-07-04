import type {
  AuthContext,
  MockPipelineRequest,
  MockPipelineResult,
} from '@ai-war-room/schemas'

export type DurableRunWorkflowInput = {
  request: MockPipelineRequest
  authContext?: AuthContext
  requestedAt: string
}

export type DurableRunWorkflowResult = {
  result: MockPipelineResult
  completedAt: string
}

export type RunWorkflowActivities = {
  validateDurableRun(input: unknown): Promise<DurableRunWorkflowInput>
  executeApprovedRun(
    input: DurableRunWorkflowInput,
  ): Promise<DurableRunWorkflowResult>
}
