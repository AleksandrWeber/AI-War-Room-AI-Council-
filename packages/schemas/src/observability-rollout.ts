import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const observabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ObservabilityRolloutCheckStatus = z.infer<
  typeof observabilityRolloutCheckStatusSchema
>

export const observabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: observabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ObservabilityRolloutCheck = z.infer<
  typeof observabilityRolloutCheckSchema
>

export const observabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ObservabilityRolloutStatus = z.infer<
  typeof observabilityRolloutStatusSchema
>

export const observabilityCapabilitiesResponseSchema = z.object({
  supportsObservabilityRollout: z.literal(true),
  supportsObservabilityAdminTools: z.literal(true),
  structuredLoggingEnabled: z.literal(true),
  tracingEnabled: z.literal(true),
  recentEventBufferCapacity: z.number().int().positive(),
  guidance: nonEmptyStringSchema,
})
export type ObservabilityCapabilitiesResponse = z.infer<
  typeof observabilityCapabilitiesResponseSchema
>

export const observabilityRolloutResponseSchema = z.object({
  status: observabilityRolloutStatusSchema,
  checks: z.array(observabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ObservabilityRolloutResponse = z.infer<
  typeof observabilityRolloutResponseSchema
>

export const criticalPipelineObservabilityEvents = [
  'pipeline_phase_completed',
  'pipeline_quota_check_completed',
  'shield_scan_completed',
  'shield_scan_classified',
  'llm_call_completed',
  'model_router_selection',
] as const

export function getObservabilityRolloutGuidance() {
  return 'Observability rollout validates structured logging, tracing spans, and pipeline event coverage before production rollout.'
}
