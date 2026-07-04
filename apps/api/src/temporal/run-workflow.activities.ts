import type { RunsService } from '../runs/runs.service.js'
import type {
  DurableRunWorkflowInput,
  RunWorkflowActivities,
} from './run-workflow.types.js'
import {
  durableRunWorkflowInputSchema,
  durableRunWorkflowResultSchema,
} from './run-workflow.validation.js'

type RunsServiceActivityPort = Pick<RunsService, 'executeMockPipeline'>

export function createRunWorkflowActivities(
  runsService: RunsServiceActivityPort,
): RunWorkflowActivities {
  return {
    async validateDurableRun(input: unknown) {
      return durableRunWorkflowInputSchema.parse(input)
    },

    async executeApprovedRun(input: DurableRunWorkflowInput) {
      const validatedInput = durableRunWorkflowInputSchema.parse(input)
      const result = await runsService.executeMockPipeline(
        validatedInput.request,
        validatedInput.authContext,
      )

      return durableRunWorkflowResultSchema.parse({
        result,
        completedAt: new Date().toISOString(),
      })
    },
  }
}
