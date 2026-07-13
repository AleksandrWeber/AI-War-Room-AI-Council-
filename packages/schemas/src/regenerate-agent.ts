import { z } from 'zod'
import { mockPipelineRequestSchema, mockPipelineResultSchema } from './run.js'

/** Body for regenerating one agent; role comes from the URL path. */
export const regenerateAgentRequestSchema = mockPipelineRequestSchema
  .omit({ selectedAgents: true })
  .extend({
    previousResult: mockPipelineResultSchema,
  })

export const regenerateAgentResponseSchema = mockPipelineResultSchema

export type RegenerateAgentRequest = z.infer<typeof regenerateAgentRequestSchema>
export type RegenerateAgentResponse = z.infer<
  typeof regenerateAgentResponseSchema
>
