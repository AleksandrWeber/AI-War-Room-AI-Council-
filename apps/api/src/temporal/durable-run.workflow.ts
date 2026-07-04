import { proxyActivities } from '@temporalio/workflow'
import type {
  DurableRunWorkflowInput,
  DurableRunWorkflowResult,
  RunWorkflowActivities,
} from './run-workflow.types.js'

const activities = proxyActivities<RunWorkflowActivities>({
  startToCloseTimeout: '10 minutes',
  retry: {
    initialInterval: '5 seconds',
    maximumAttempts: 3,
  },
})

export async function durableRunWorkflow(
  input: DurableRunWorkflowInput,
): Promise<DurableRunWorkflowResult> {
  const validatedInput = await activities.validateDurableRun(input)

  return activities.executeApprovedRun(validatedInput)
}
