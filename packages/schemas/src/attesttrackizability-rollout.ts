import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const attesttrackizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type AttesttrackizabilityRolloutCheckStatus = z.infer<
  typeof attesttrackizabilityRolloutCheckStatusSchema
>

export const attesttrackizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: attesttrackizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type AttesttrackizabilityRolloutCheck = z.infer<typeof attesttrackizabilityRolloutCheckSchema>

export const attesttrackizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type AttesttrackizabilityRolloutStatus = z.infer<typeof attesttrackizabilityRolloutStatusSchema>

export const attesttrackizabilityCapabilitiesResponseSchema = z.object({
  supportsAttesttrackizabilityRollout: z.literal(true),
  supportsAttesttrackizabilityAdminTools: z.literal(true),
  supportsMembershipAttesttrackizabilitySignals: z.literal(true),
  supportsUsageEventAttesttrackizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type AttesttrackizabilityCapabilitiesResponse = z.infer<
  typeof attesttrackizabilityCapabilitiesResponseSchema
>

export const attesttrackizabilityRolloutResponseSchema = z.object({
  status: attesttrackizabilityRolloutStatusSchema,
  checks: z.array(attesttrackizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type AttesttrackizabilityRolloutResponse = z.infer<
  typeof attesttrackizabilityRolloutResponseSchema
>

export function getAttesttrackizabilityRolloutGuidance() {
  return 'Production attesttrackizability rollout validates membership attesttrackizability, usage event attesttrackizability signals, billing notification coverage, and healingization readiness before production attesttrackizability tooling.'
}
