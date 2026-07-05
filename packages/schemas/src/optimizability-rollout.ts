import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const optimizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type OptimizabilityRolloutCheckStatus = z.infer<
  typeof optimizabilityRolloutCheckStatusSchema
>

export const optimizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: optimizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type OptimizabilityRolloutCheck = z.infer<typeof optimizabilityRolloutCheckSchema>

export const optimizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type OptimizabilityRolloutStatus = z.infer<typeof optimizabilityRolloutStatusSchema>

export const optimizabilityCapabilitiesResponseSchema = z.object({
  supportsOptimizabilityRollout: z.literal(true),
  supportsOptimizabilityAdminTools: z.literal(true),
  supportsModelHealthOptimizabilitySignals: z.literal(true),
  supportsModelRegistryOptimizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type OptimizabilityCapabilitiesResponse = z.infer<
  typeof optimizabilityCapabilitiesResponseSchema
>

export const optimizabilityRolloutResponseSchema = z.object({
  status: optimizabilityRolloutStatusSchema,
  checks: z.array(optimizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type OptimizabilityRolloutResponse = z.infer<
  typeof optimizabilityRolloutResponseSchema
>

export function getOptimizabilityRolloutGuidance() {
  return 'Production optimizability rollout validates model health optimizability, model registry optimizability signals, billing record coverage, and optimization readiness before production optimizability tooling.'
}
