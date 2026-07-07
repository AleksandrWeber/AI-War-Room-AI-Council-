import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const attestationvaultizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type AttestationvaultizabilityRolloutCheckStatus = z.infer<
  typeof attestationvaultizabilityRolloutCheckStatusSchema
>

export const attestationvaultizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: attestationvaultizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type AttestationvaultizabilityRolloutCheck = z.infer<typeof attestationvaultizabilityRolloutCheckSchema>

export const attestationvaultizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type AttestationvaultizabilityRolloutStatus = z.infer<typeof attestationvaultizabilityRolloutStatusSchema>

export const attestationvaultizabilityCapabilitiesResponseSchema = z.object({
  supportsAttestationvaultizabilityRollout: z.literal(true),
  supportsAttestationvaultizabilityAdminTools: z.literal(true),
  supportsBillingNotificationAttestationvaultizabilitySignals: z.literal(true),
  supportsBillingWebhookAttestationvaultizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type AttestationvaultizabilityCapabilitiesResponse = z.infer<
  typeof attestationvaultizabilityCapabilitiesResponseSchema
>

export const attestationvaultizabilityRolloutResponseSchema = z.object({
  status: attestationvaultizabilityRolloutStatusSchema,
  checks: z.array(attestationvaultizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type AttestationvaultizabilityRolloutResponse = z.infer<
  typeof attestationvaultizabilityRolloutResponseSchema
>

export function getAttestationvaultizabilityRolloutGuidance() {
  return 'Production attestationvaultizability rollout validates billing notification attestationvaultizability, billing webhook attestationvaultizability signals, usage event coverage, and governanceization readiness before production attestationvaultizability tooling.'
}
