import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const attestjournalizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type AttestjournalizabilityRolloutCheckStatus = z.infer<
  typeof attestjournalizabilityRolloutCheckStatusSchema
>

export const attestjournalizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: attestjournalizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type AttestjournalizabilityRolloutCheck = z.infer<typeof attestjournalizabilityRolloutCheckSchema>

export const attestjournalizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type AttestjournalizabilityRolloutStatus = z.infer<typeof attestjournalizabilityRolloutStatusSchema>

export const attestjournalizabilityCapabilitiesResponseSchema = z.object({
  supportsAttestjournalizabilityRollout: z.literal(true),
  supportsAttestjournalizabilityAdminTools: z.literal(true),
  supportsShieldScanAttestjournalizabilitySignals: z.literal(true),
  supportsProviderCredentialAttestjournalizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type AttestjournalizabilityCapabilitiesResponse = z.infer<
  typeof attestjournalizabilityCapabilitiesResponseSchema
>

export const attestjournalizabilityRolloutResponseSchema = z.object({
  status: attestjournalizabilityRolloutStatusSchema,
  checks: z.array(attestjournalizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type AttestjournalizabilityRolloutResponse = z.infer<
  typeof attestjournalizabilityRolloutResponseSchema
>

export function getAttestjournalizabilityRolloutGuidance() {
  return 'Production attestjournalizability rollout validates shield scan attestjournalizability, provider credential attestjournalizability signals, billing webhook coverage, and reconciliationization readiness before production attestjournalizability tooling.'
}
