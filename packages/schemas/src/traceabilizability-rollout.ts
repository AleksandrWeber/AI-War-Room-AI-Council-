import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const traceabilizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type TraceabilizabilityRolloutCheckStatus = z.infer<
  typeof traceabilizabilityRolloutCheckStatusSchema
>

export const traceabilizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: traceabilizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type TraceabilizabilityRolloutCheck = z.infer<typeof traceabilizabilityRolloutCheckSchema>

export const traceabilizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type TraceabilizabilityRolloutStatus = z.infer<typeof traceabilizabilityRolloutStatusSchema>

export const traceabilizabilityCapabilitiesResponseSchema = z.object({
  supportsTraceabilizabilityRollout: z.literal(true),
  supportsTraceabilizabilityAdminTools: z.literal(true),
  supportsIdempotencyKeyTraceabilizabilitySignals: z.literal(true),
  supportsUsageEventTraceabilizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type TraceabilizabilityCapabilitiesResponse = z.infer<
  typeof traceabilizabilityCapabilitiesResponseSchema
>

export const traceabilizabilityRolloutResponseSchema = z.object({
  status: traceabilizabilityRolloutStatusSchema,
  checks: z.array(traceabilizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type TraceabilizabilityRolloutResponse = z.infer<
  typeof traceabilizabilityRolloutResponseSchema
>

export function getTraceabilizabilityRolloutGuidance() {
  return 'Production traceabilizability rollout validates idempotency key traceabilizability, usage event traceabilizability signals, billing webhook coverage, and traceabilization readiness before production traceabilizability tooling.'
}
