import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const distinguishabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type DistinguishabilityRolloutCheckStatus = z.infer<
  typeof distinguishabilityRolloutCheckStatusSchema
>

export const distinguishabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: distinguishabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type DistinguishabilityRolloutCheck = z.infer<typeof distinguishabilityRolloutCheckSchema>

export const distinguishabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type DistinguishabilityRolloutStatus = z.infer<typeof distinguishabilityRolloutStatusSchema>

export const distinguishabilityCapabilitiesResponseSchema = z.object({
  supportsDistinguishabilityRollout: z.literal(true),
  supportsDistinguishabilityAdminTools: z.literal(true),
  supportsSynthesisDistinguishabilitySignals: z.literal(true),
  supportsAgentOutputDistinguishabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type DistinguishabilityCapabilitiesResponse = z.infer<
  typeof distinguishabilityCapabilitiesResponseSchema
>

export const distinguishabilityRolloutResponseSchema = z.object({
  status: distinguishabilityRolloutStatusSchema,
  checks: z.array(distinguishabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type DistinguishabilityRolloutResponse = z.infer<
  typeof distinguishabilityRolloutResponseSchema
>

export function getDistinguishabilityRolloutGuidance() {
  return 'Production distinguishability rollout validates synthesis distinguishability, agent output distinguishability signals, run workflow coverage, and differentiation readiness before production distinguishability tooling.'
}
