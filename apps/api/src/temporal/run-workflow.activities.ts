import type { RunsService } from '../runs/runs.service.js'
import type { StreamEventBufferService } from '../persistence/stream-event-buffer.service.js'
import type {
  DurableRunWorkflowInput,
  RunWorkflowActivities,
} from './run-workflow.types.js'
import {
  durableRunWorkflowInputSchema,
  durableRunWorkflowResultSchema,
} from './run-workflow.validation.js'

type RunsServiceActivityPort = Pick<RunsService, 'executeMockPipelineStream'>

type StreamEventBufferActivityPort = Pick<StreamEventBufferService, 'append'>

export function createRunWorkflowActivities(deps: {
  runsService: RunsServiceActivityPort
  streamEventBufferService: StreamEventBufferActivityPort
}): RunWorkflowActivities {
  return {
    async validateDurableRun(input: unknown) {
      return durableRunWorkflowInputSchema.parse(input)
    },

    async executeApprovedRun(input: DurableRunWorkflowInput) {
      const validatedInput = durableRunWorkflowInputSchema.parse(input)
      const result = await deps.runsService.executeMockPipelineStream(
        validatedInput.request,
        async (event) => {
          await deps.streamEventBufferService.append({
            workspaceId: validatedInput.request.draftRun.workspaceId,
            runId: validatedInput.request.draftRun.runId,
            event,
          })
        },
        validatedInput.authContext,
      )

      return durableRunWorkflowResultSchema.parse({
        result,
        completedAt: new Date().toISOString(),
      })
    },
  }
}
