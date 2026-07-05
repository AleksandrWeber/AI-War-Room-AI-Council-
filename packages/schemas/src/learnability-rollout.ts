import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const learnabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type LearnabilityRolloutCheckStatus = z.infer<
  typeof learnabilityRolloutCheckStatusSchema
>

export const learnabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: learnabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type LearnabilityRolloutCheck = z.infer<typeof learnabilityRolloutCheckSchema>

export const learnabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type LearnabilityRolloutStatus = z.infer<typeof learnabilityRolloutStatusSchema>

export const learnabilityCapabilitiesResponseSchema = z.object({
  supportsLearnabilityRollout: z.literal(true),
  supportsLearnabilityAdminTools: z.literal(true),
  supportsAgentOutputLearnabilitySignals: z.literal(true),
  supportsArtifactLearnabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type LearnabilityCapabilitiesResponse = z.infer<
  typeof learnabilityCapabilitiesResponseSchema
>

export const learnabilityRolloutResponseSchema = z.object({
  status: learnabilityRolloutStatusSchema,
  checks: z.array(learnabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type LearnabilityRolloutResponse = z.infer<
  typeof learnabilityRolloutResponseSchema
>

export function getLearnabilityRolloutGuidance() {
  return 'Production learnability rollout validates agent output learnability, artifact learnability signals, synthesis coverage, and learning readiness before production learnability tooling.'
}
