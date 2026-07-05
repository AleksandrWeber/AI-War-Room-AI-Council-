import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const performanceRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type PerformanceRolloutCheckStatus = z.infer<
  typeof performanceRolloutCheckStatusSchema
>

export const performanceRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: performanceRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type PerformanceRolloutCheck = z.infer<
  typeof performanceRolloutCheckSchema
>

export const performanceRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type PerformanceRolloutStatus = z.infer<
  typeof performanceRolloutStatusSchema
>

export const performanceCapabilitiesResponseSchema = z.object({
  supportsPerformanceRollout: z.literal(true),
  supportsPerformanceAdminTools: z.literal(true),
  supportsPipelineLatencySignals: z.literal(true),
  supportsTracingLatencySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type PerformanceCapabilitiesResponse = z.infer<
  typeof performanceCapabilitiesResponseSchema
>

export const performanceRolloutResponseSchema = z.object({
  status: performanceRolloutStatusSchema,
  checks: z.array(performanceRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type PerformanceRolloutResponse = z.infer<
  typeof performanceRolloutResponseSchema
>

export function getPerformanceRolloutGuidance() {
  return 'Production performance rollout validates pipeline latency signals, model health events, observability buffers, and tracing instrumentation before latency-ready operations.'
}
