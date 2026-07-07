import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const attestationizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type AttestationizabilityRolloutCheckStatus = z.infer<
  typeof attestationizabilityRolloutCheckStatusSchema
>

export const attestationizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: attestationizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type AttestationizabilityRolloutCheck = z.infer<typeof attestationizabilityRolloutCheckSchema>

export const attestationizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type AttestationizabilityRolloutStatus = z.infer<typeof attestationizabilityRolloutStatusSchema>

export const attestationizabilityCapabilitiesResponseSchema = z.object({
  supportsAttestationizabilityRollout: z.literal(true),
  supportsAttestationizabilityAdminTools: z.literal(true),
  supportsBillingNotificationAttestationizabilitySignals: z.literal(true),
  supportsBillingWebhookAttestationizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type AttestationizabilityCapabilitiesResponse = z.infer<
  typeof attestationizabilityCapabilitiesResponseSchema
>

export const attestationizabilityRolloutResponseSchema = z.object({
  status: attestationizabilityRolloutStatusSchema,
  checks: z.array(attestationizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type AttestationizabilityRolloutResponse = z.infer<
  typeof attestationizabilityRolloutResponseSchema
>

export function getAttestationizabilityRolloutGuidance() {
  return 'Production attestationizability rollout validates billing notification attestationizability, billing webhook attestationizability signals, usage event coverage, and governanceization readiness before production attestationizability tooling.'
}
