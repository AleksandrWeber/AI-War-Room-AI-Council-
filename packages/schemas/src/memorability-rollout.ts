import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const memorabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type MemorabilityRolloutCheckStatus = z.infer<
  typeof memorabilityRolloutCheckStatusSchema
>

export const memorabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: memorabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type MemorabilityRolloutCheck = z.infer<typeof memorabilityRolloutCheckSchema>

export const memorabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type MemorabilityRolloutStatus = z.infer<typeof memorabilityRolloutStatusSchema>

export const memorabilityCapabilitiesResponseSchema = z.object({
  supportsMemorabilityRollout: z.literal(true),
  supportsMemorabilityAdminTools: z.literal(true),
  supportsArtifactMemorabilitySignals: z.literal(true),
  supportsWorkflowMemorabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type MemorabilityCapabilitiesResponse = z.infer<
  typeof memorabilityCapabilitiesResponseSchema
>

export const memorabilityRolloutResponseSchema = z.object({
  status: memorabilityRolloutStatusSchema,
  checks: z.array(memorabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type MemorabilityRolloutResponse = z.infer<
  typeof memorabilityRolloutResponseSchema
>

export function getMemorabilityRolloutGuidance() {
  return 'Production memorability rollout validates artifact memorability, workflow memorability signals, idempotency key coverage, and memory readiness before production memorability tooling.'
}
