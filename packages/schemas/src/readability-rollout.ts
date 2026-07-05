import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const readabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ReadabilityRolloutCheckStatus = z.infer<
  typeof readabilityRolloutCheckStatusSchema
>

export const readabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: readabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ReadabilityRolloutCheck = z.infer<typeof readabilityRolloutCheckSchema>

export const readabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ReadabilityRolloutStatus = z.infer<typeof readabilityRolloutStatusSchema>

export const readabilityCapabilitiesResponseSchema = z.object({
  supportsReadabilityRollout: z.literal(true),
  supportsReadabilityAdminTools: z.literal(true),
  supportsArtifactReadabilitySignals: z.literal(true),
  supportsAgentOutputReadabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ReadabilityCapabilitiesResponse = z.infer<
  typeof readabilityCapabilitiesResponseSchema
>

export const readabilityRolloutResponseSchema = z.object({
  status: readabilityRolloutStatusSchema,
  checks: z.array(readabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ReadabilityRolloutResponse = z.infer<
  typeof readabilityRolloutResponseSchema
>

export function getReadabilityRolloutGuidance() {
  return 'Production readability rollout validates artifact readability, agent output readability signals, synthesis coverage, and readability readiness before production readability tooling.'
}
