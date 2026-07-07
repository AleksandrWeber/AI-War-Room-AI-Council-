import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const proofregistryizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ProofregistryizabilityRolloutCheckStatus = z.infer<
  typeof proofregistryizabilityRolloutCheckStatusSchema
>

export const proofregistryizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: proofregistryizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ProofregistryizabilityRolloutCheck = z.infer<typeof proofregistryizabilityRolloutCheckSchema>

export const proofregistryizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ProofregistryizabilityRolloutStatus = z.infer<typeof proofregistryizabilityRolloutStatusSchema>

export const proofregistryizabilityCapabilitiesResponseSchema = z.object({
  supportsProofregistryizabilityRollout: z.literal(true),
  supportsProofregistryizabilityAdminTools: z.literal(true),
  supportsShieldScanProofregistryizabilitySignals: z.literal(true),
  supportsProviderCredentialProofregistryizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ProofregistryizabilityCapabilitiesResponse = z.infer<
  typeof proofregistryizabilityCapabilitiesResponseSchema
>

export const proofregistryizabilityRolloutResponseSchema = z.object({
  status: proofregistryizabilityRolloutStatusSchema,
  checks: z.array(proofregistryizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ProofregistryizabilityRolloutResponse = z.infer<
  typeof proofregistryizabilityRolloutResponseSchema
>

export function getProofregistryizabilityRolloutGuidance() {
  return 'Production proofregistryizability rollout validates shield scan proofregistryizability, provider credential proofregistryizability signals, billing webhook coverage, and reconciliationization readiness before production proofregistryizability tooling.'
}
