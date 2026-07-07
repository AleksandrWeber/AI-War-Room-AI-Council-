import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const accreditationizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type AccreditationizabilityRolloutCheckStatus = z.infer<
  typeof accreditationizabilityRolloutCheckStatusSchema
>

export const accreditationizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: accreditationizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type AccreditationizabilityRolloutCheck = z.infer<typeof accreditationizabilityRolloutCheckSchema>

export const accreditationizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type AccreditationizabilityRolloutStatus = z.infer<typeof accreditationizabilityRolloutStatusSchema>

export const accreditationizabilityCapabilitiesResponseSchema = z.object({
  supportsAccreditationizabilityRollout: z.literal(true),
  supportsAccreditationizabilityAdminTools: z.literal(true),
  supportsMembershipAccreditationizabilitySignals: z.literal(true),
  supportsUsageEventAccreditationizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type AccreditationizabilityCapabilitiesResponse = z.infer<
  typeof accreditationizabilityCapabilitiesResponseSchema
>

export const accreditationizabilityRolloutResponseSchema = z.object({
  status: accreditationizabilityRolloutStatusSchema,
  checks: z.array(accreditationizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type AccreditationizabilityRolloutResponse = z.infer<
  typeof accreditationizabilityRolloutResponseSchema
>

export function getAccreditationizabilityRolloutGuidance() {
  return 'Production accreditationizability rollout validates membership accreditationizability, usage event accreditationizability signals, billing notification coverage, and healingization readiness before production accreditationizability tooling.'
}
