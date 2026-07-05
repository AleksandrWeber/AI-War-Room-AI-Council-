import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const composabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ComposabilityRolloutCheckStatus = z.infer<
  typeof composabilityRolloutCheckStatusSchema
>

export const composabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: composabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ComposabilityRolloutCheck = z.infer<typeof composabilityRolloutCheckSchema>

export const composabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ComposabilityRolloutStatus = z.infer<typeof composabilityRolloutStatusSchema>

export const composabilityCapabilitiesResponseSchema = z.object({
  supportsComposabilityRollout: z.literal(true),
  supportsComposabilityAdminTools: z.literal(true),
  supportsWorkflowComposabilitySignals: z.literal(true),
  supportsAgentOutputComposabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ComposabilityCapabilitiesResponse = z.infer<
  typeof composabilityCapabilitiesResponseSchema
>

export const composabilityRolloutResponseSchema = z.object({
  status: composabilityRolloutStatusSchema,
  checks: z.array(composabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ComposabilityRolloutResponse = z.infer<
  typeof composabilityRolloutResponseSchema
>

export function getComposabilityRolloutGuidance() {
  return 'Production composability rollout validates workflow composability, agent output composability signals, artifact coverage, and composition readiness before production composability tooling.'
}
