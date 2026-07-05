import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const attestationRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type AttestationRolloutCheckStatus = z.infer<
  typeof attestationRolloutCheckStatusSchema
>

export const attestationRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: attestationRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type AttestationRolloutCheck = z.infer<typeof attestationRolloutCheckSchema>

export const attestationRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type AttestationRolloutStatus = z.infer<typeof attestationRolloutStatusSchema>

export const attestationCapabilitiesResponseSchema = z.object({
  supportsAttestationRollout: z.literal(true),
  supportsAttestationAdminTools: z.literal(true),
  supportsModelRegistryAttestationSignals: z.literal(true),
  supportsProviderCredentialAttestationSignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type AttestationCapabilitiesResponse = z.infer<
  typeof attestationCapabilitiesResponseSchema
>

export const attestationRolloutResponseSchema = z.object({
  status: attestationRolloutStatusSchema,
  checks: z.array(attestationRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type AttestationRolloutResponse = z.infer<
  typeof attestationRolloutResponseSchema
>

export function getAttestationRolloutGuidance() {
  return 'Production attestation rollout validates model registry attestation, provider credential attestation signals, health event coverage, and verification readiness before production attestation tooling.'
}
