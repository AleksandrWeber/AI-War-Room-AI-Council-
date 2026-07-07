import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const registrationizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type RegistrationizabilityRolloutCheckStatus = z.infer<
  typeof registrationizabilityRolloutCheckStatusSchema
>

export const registrationizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: registrationizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type RegistrationizabilityRolloutCheck = z.infer<typeof registrationizabilityRolloutCheckSchema>

export const registrationizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type RegistrationizabilityRolloutStatus = z.infer<typeof registrationizabilityRolloutStatusSchema>

export const registrationizabilityCapabilitiesResponseSchema = z.object({
  supportsRegistrationizabilityRollout: z.literal(true),
  supportsRegistrationizabilityAdminTools: z.literal(true),
  supportsMeterUsageRegistrationizabilitySignals: z.literal(true),
  supportsUsageEventRegistrationizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type RegistrationizabilityCapabilitiesResponse = z.infer<
  typeof registrationizabilityCapabilitiesResponseSchema
>

export const registrationizabilityRolloutResponseSchema = z.object({
  status: registrationizabilityRolloutStatusSchema,
  checks: z.array(registrationizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type RegistrationizabilityRolloutResponse = z.infer<
  typeof registrationizabilityRolloutResponseSchema
>

export function getRegistrationizabilityRolloutGuidance() {
  return 'Production registrationizability rollout validates meter usage registrationizability, usage event registrationizability signals, workspace limit coverage, and registrationization readiness before production registrationizability tooling.'
}
