import type { AuthContext, MockPipelineResult } from '@ai-war-room/schemas'
import type { PipelineStreamEvent } from '@ai-war-room/schemas'

export const APPROVED_RUN_EXECUTOR = Symbol('APPROVED_RUN_EXECUTOR')

export type ApprovedRunStreamEmitter = (
  event: PipelineStreamEvent,
) => void | Promise<void>

/**
 * Stable execution port for Temporal workers and other feature modules.
 * Intentionally excludes draft/history/capabilities surface from RunsService.
 */
export type ApprovedRunExecutor = {
  executeMockPipelineStream(
    input: unknown,
    emit: ApprovedRunStreamEmitter,
    authContext?: AuthContext,
  ): Promise<MockPipelineResult>
}
