import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const verificationvaultizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type VerificationvaultizabilityRolloutCheckStatus = z.infer<
  typeof verificationvaultizabilityRolloutCheckStatusSchema
>

export const verificationvaultizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: verificationvaultizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type VerificationvaultizabilityRolloutCheck = z.infer<typeof verificationvaultizabilityRolloutCheckSchema>

export const verificationvaultizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type VerificationvaultizabilityRolloutStatus = z.infer<typeof verificationvaultizabilityRolloutStatusSchema>

export const verificationvaultizabilityCapabilitiesResponseSchema = z.object({
  supportsVerificationvaultizabilityRollout: z.literal(true),
  supportsVerificationvaultizabilityAdminTools: z.literal(true),
  supportsShieldScanVerificationvaultizabilitySignals: z.literal(true),
  supportsProviderCredentialVerificationvaultizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type VerificationvaultizabilityCapabilitiesResponse = z.infer<
  typeof verificationvaultizabilityCapabilitiesResponseSchema
>

export const verificationvaultizabilityRolloutResponseSchema = z.object({
  status: verificationvaultizabilityRolloutStatusSchema,
  checks: z.array(verificationvaultizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type VerificationvaultizabilityRolloutResponse = z.infer<
  typeof verificationvaultizabilityRolloutResponseSchema
>

export function getVerificationvaultizabilityRolloutGuidance() {
  return 'Production verificationvaultizability rollout validates shield scan verificationvaultizability, provider credential verificationvaultizability signals, billing webhook coverage, and reconciliationization readiness before production verificationvaultizability tooling.'
}
