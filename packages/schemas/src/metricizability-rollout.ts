import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const metricizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type MetricizabilityRolloutCheckStatus = z.infer<
  typeof metricizabilityRolloutCheckStatusSchema
>

export const metricizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: metricizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type MetricizabilityRolloutCheck = z.infer<typeof metricizabilityRolloutCheckSchema>

export const metricizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type MetricizabilityRolloutStatus = z.infer<typeof metricizabilityRolloutStatusSchema>

export const metricizabilityCapabilitiesResponseSchema = z.object({
  supportsMetricizabilityRollout: z.literal(true),
  supportsMetricizabilityAdminTools: z.literal(true),
  supportsIdempotencyKeyMetricizabilitySignals: z.literal(true),
  supportsUsageEventMetricizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type MetricizabilityCapabilitiesResponse = z.infer<
  typeof metricizabilityCapabilitiesResponseSchema
>

export const metricizabilityRolloutResponseSchema = z.object({
  status: metricizabilityRolloutStatusSchema,
  checks: z.array(metricizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type MetricizabilityRolloutResponse = z.infer<
  typeof metricizabilityRolloutResponseSchema
>

export function getMetricizabilityRolloutGuidance() {
  return 'Production metricizability rollout validates idempotency key metricizability, usage event metricizability signals, billing webhook coverage, and metricization readiness before production metricizability tooling.'
}
