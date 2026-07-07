import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const nonrepudiationizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type NonrepudiationizabilityRolloutCheckStatus = z.infer<
  typeof nonrepudiationizabilityRolloutCheckStatusSchema
>

export const nonrepudiationizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: nonrepudiationizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type NonrepudiationizabilityRolloutCheck = z.infer<typeof nonrepudiationizabilityRolloutCheckSchema>

export const nonrepudiationizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type NonrepudiationizabilityRolloutStatus = z.infer<typeof nonrepudiationizabilityRolloutStatusSchema>

export const nonrepudiationizabilityCapabilitiesResponseSchema = z.object({
  supportsNonrepudiationizabilityRollout: z.literal(true),
  supportsNonrepudiationizabilityAdminTools: z.literal(true),
  supportsMembershipNonrepudiationizabilitySignals: z.literal(true),
  supportsUsageEventNonrepudiationizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type NonrepudiationizabilityCapabilitiesResponse = z.infer<
  typeof nonrepudiationizabilityCapabilitiesResponseSchema
>

export const nonrepudiationizabilityRolloutResponseSchema = z.object({
  status: nonrepudiationizabilityRolloutStatusSchema,
  checks: z.array(nonrepudiationizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type NonrepudiationizabilityRolloutResponse = z.infer<
  typeof nonrepudiationizabilityRolloutResponseSchema
>

export function getNonrepudiationizabilityRolloutGuidance() {
  return 'Production nonrepudiationizability rollout validates membership nonrepudiationizability, usage event nonrepudiationizability signals, billing notification coverage, and healingization readiness before production nonrepudiationizability tooling.'
}
