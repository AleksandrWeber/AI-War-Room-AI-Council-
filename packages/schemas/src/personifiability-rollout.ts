import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const personifiabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type PersonifiabilityRolloutCheckStatus = z.infer<
  typeof personifiabilityRolloutCheckStatusSchema
>

export const personifiabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: personifiabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type PersonifiabilityRolloutCheck = z.infer<typeof personifiabilityRolloutCheckSchema>

export const personifiabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type PersonifiabilityRolloutStatus = z.infer<typeof personifiabilityRolloutStatusSchema>

export const personifiabilityCapabilitiesResponseSchema = z.object({
  supportsPersonifiabilityRollout: z.literal(true),
  supportsPersonifiabilityAdminTools: z.literal(true),
  supportsAgentOutputPersonifiabilitySignals: z.literal(true),
  supportsSynthesisPersonifiabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type PersonifiabilityCapabilitiesResponse = z.infer<
  typeof personifiabilityCapabilitiesResponseSchema
>

export const personifiabilityRolloutResponseSchema = z.object({
  status: personifiabilityRolloutStatusSchema,
  checks: z.array(personifiabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type PersonifiabilityRolloutResponse = z.infer<
  typeof personifiabilityRolloutResponseSchema
>

export function getPersonifiabilityRolloutGuidance() {
  return 'Production personifiability rollout validates agent output personifiability, synthesis personifiability signals, artifact coverage, and personification readiness before production personifiability tooling.'
}
