import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const temporalWorkflowStatusSchema = z.enum([
  'disabled',
  'running',
  'completed',
  'failed',
  'canceled',
  'terminated',
  'timed_out',
  'continued_as_new',
  'unknown',
])
export type TemporalWorkflowStatus = z.infer<typeof temporalWorkflowStatusSchema>

export const temporalRunStartResponseSchema = z.object({
  runId: nonEmptyStringSchema,
  workspaceId: nonEmptyStringSchema,
  workflowId: nonEmptyStringSchema,
  temporalRunId: z.string().trim().min(1).optional(),
  taskQueue: nonEmptyStringSchema,
  status: temporalWorkflowStatusSchema,
  temporalEnabled: z.literal(true),
  startedAt: utcDateStringSchema,
})
export type TemporalRunStartResponse = z.infer<
  typeof temporalRunStartResponseSchema
>

export const temporalRunStatusResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  workflowId: nonEmptyStringSchema,
  temporalRunId: z.string().trim().min(1).optional(),
  taskQueue: nonEmptyStringSchema,
  status: temporalWorkflowStatusSchema,
  temporalEnabled: z.literal(true),
  checkedAt: utcDateStringSchema,
})
export type TemporalRunStatusResponse = z.infer<
  typeof temporalRunStatusResponseSchema
>
