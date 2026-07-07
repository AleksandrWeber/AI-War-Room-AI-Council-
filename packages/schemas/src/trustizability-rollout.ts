import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const trustizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type TrustizabilityRolloutCheckStatus = z.infer<
  typeof trustizabilityRolloutCheckStatusSchema
>

export const trustizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: trustizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type TrustizabilityRolloutCheck = z.infer<typeof trustizabilityRolloutCheckSchema>

export const trustizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type TrustizabilityRolloutStatus = z.infer<typeof trustizabilityRolloutStatusSchema>

export const trustizabilityCapabilitiesResponseSchema = z.object({
  supportsTrustizabilityRollout: z.literal(true),
  supportsTrustizabilityAdminTools: z.literal(true),
  supportsShieldScanTrustizabilitySignals: z.literal(true),
  supportsProviderCredentialTrustizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type TrustizabilityCapabilitiesResponse = z.infer<
  typeof trustizabilityCapabilitiesResponseSchema
>

export const trustizabilityRolloutResponseSchema = z.object({
  status: trustizabilityRolloutStatusSchema,
  checks: z.array(trustizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type TrustizabilityRolloutResponse = z.infer<
  typeof trustizabilityRolloutResponseSchema
>

export function getTrustizabilityRolloutGuidance() {
  return 'Production trustizability rollout validates shield scan trustizability, provider credential trustizability signals, billing webhook coverage, and reconciliationization readiness before production trustizability tooling.'
}
