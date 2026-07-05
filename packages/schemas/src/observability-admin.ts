import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const observabilityEventLevelSchema = z.enum(['info', 'warn', 'error'])
export type ObservabilityEventLevel = z.infer<
  typeof observabilityEventLevelSchema
>

export const observabilityAdminEventSchema = z.object({
  eventName: nonEmptyStringSchema,
  level: observabilityEventLevelSchema,
  timestamp: utcDateStringSchema,
  runId: nonEmptyStringSchema.optional(),
})
export type ObservabilityAdminEvent = z.infer<
  typeof observabilityAdminEventSchema
>

export const observabilityAdminStatsSchema = z.object({
  totalEvents: z.number().int().nonnegative(),
  errorEvents: z.number().int().nonnegative(),
  warnEvents: z.number().int().nonnegative(),
  pipelinePhaseEvents: z.number().int().nonnegative(),
  shieldEvents: z.number().int().nonnegative(),
  llmEvents: z.number().int().nonnegative(),
})
export type ObservabilityAdminStats = z.infer<
  typeof observabilityAdminStatsSchema
>

export const observabilityAdminActionSchema = z.enum([
  'refresh_event_summary',
  'clear_observability_buffer',
])
export type ObservabilityAdminAction = z.infer<
  typeof observabilityAdminActionSchema
>

export const observabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  events: z.array(observabilityAdminEventSchema),
  stats: observabilityAdminStatsSchema,
  availableActions: z.array(observabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ObservabilityAdminSummaryResponse = z.infer<
  typeof observabilityAdminSummaryResponseSchema
>

export const observabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: observabilityAdminActionSchema,
})
export type ObservabilityAdminActionRequest = z.infer<
  typeof observabilityAdminActionRequestSchema
>

export const observabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: observabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: observabilityAdminStatsSchema.optional(),
})
export type ObservabilityAdminActionResponse = z.infer<
  typeof observabilityAdminActionResponseSchema
>
