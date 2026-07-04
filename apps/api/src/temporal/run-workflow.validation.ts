import {
  authContextSchema,
  mockPipelineRequestSchema,
  mockPipelineResultSchema,
} from '@ai-war-room/schemas'
import { z } from 'zod'

export const durableRunWorkflowInputSchema = z.object({
  request: mockPipelineRequestSchema,
  authContext: authContextSchema.optional(),
  requestedAt: z.iso.datetime(),
})

export const durableRunWorkflowResultSchema = z.object({
  result: mockPipelineResultSchema,
  completedAt: z.iso.datetime(),
})
