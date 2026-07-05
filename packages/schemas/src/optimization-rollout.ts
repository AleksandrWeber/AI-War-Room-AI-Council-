import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const optimizationRolloutCheckStatusSchema = z.enum([
  'pass',
  'fail',
  'skip',
])
export type OptimizationRolloutCheckStatus = z.infer<
  typeof optimizationRolloutCheckStatusSchema
>

export const optimizationRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: optimizationRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type OptimizationRolloutCheck = z.infer<
  typeof optimizationRolloutCheckSchema
>

export const optimizationRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type OptimizationRolloutStatus = z.infer<
  typeof optimizationRolloutStatusSchema
>

export const optimizationCapabilitiesResponseSchema = z.object({
  supportsOptimizationRollout: z.literal(true),
  supportsOptimizationAdminTools: z.literal(true),
  supportsModelHealthOptimizationSignals: z.literal(true),
  supportsUsageOptimizationSignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type OptimizationCapabilitiesResponse = z.infer<
  typeof optimizationCapabilitiesResponseSchema
>

export const optimizationRolloutResponseSchema = z.object({
  status: optimizationRolloutStatusSchema,
  checks: z.array(optimizationRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type OptimizationRolloutResponse = z.infer<
  typeof optimizationRolloutResponseSchema
>

export function getOptimizationRolloutGuidance() {
  return 'Production optimization rollout validates model health optimization, usage optimization signals, run outcome coverage, and performance readiness before production optimization tooling.'
}
