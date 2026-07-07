import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const cryptographyizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type CryptographyizabilityRolloutCheckStatus = z.infer<
  typeof cryptographyizabilityRolloutCheckStatusSchema
>

export const cryptographyizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: cryptographyizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type CryptographyizabilityRolloutCheck = z.infer<typeof cryptographyizabilityRolloutCheckSchema>

export const cryptographyizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type CryptographyizabilityRolloutStatus = z.infer<typeof cryptographyizabilityRolloutStatusSchema>

export const cryptographyizabilityCapabilitiesResponseSchema = z.object({
  supportsCryptographyizabilityRollout: z.literal(true),
  supportsCryptographyizabilityAdminTools: z.literal(true),
  supportsShieldScanCryptographyizabilitySignals: z.literal(true),
  supportsProviderCredentialCryptographyizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type CryptographyizabilityCapabilitiesResponse = z.infer<
  typeof cryptographyizabilityCapabilitiesResponseSchema
>

export const cryptographyizabilityRolloutResponseSchema = z.object({
  status: cryptographyizabilityRolloutStatusSchema,
  checks: z.array(cryptographyizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type CryptographyizabilityRolloutResponse = z.infer<
  typeof cryptographyizabilityRolloutResponseSchema
>

export function getCryptographyizabilityRolloutGuidance() {
  return 'Production cryptographyizability rollout validates shield scan cryptographyizability, provider credential cryptographyizability signals, billing webhook coverage, and reconciliationization readiness before production cryptographyizability tooling.'
}
