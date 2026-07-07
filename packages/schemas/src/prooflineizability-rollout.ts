import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const prooflineizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ProoflineizabilityRolloutCheckStatus = z.infer<
  typeof prooflineizabilityRolloutCheckStatusSchema
>

export const prooflineizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: prooflineizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ProoflineizabilityRolloutCheck = z.infer<typeof prooflineizabilityRolloutCheckSchema>

export const prooflineizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ProoflineizabilityRolloutStatus = z.infer<typeof prooflineizabilityRolloutStatusSchema>

export const prooflineizabilityCapabilitiesResponseSchema = z.object({
  supportsProoflineizabilityRollout: z.literal(true),
  supportsProoflineizabilityAdminTools: z.literal(true),
  supportsShieldScanProoflineizabilitySignals: z.literal(true),
  supportsProviderCredentialProoflineizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ProoflineizabilityCapabilitiesResponse = z.infer<
  typeof prooflineizabilityCapabilitiesResponseSchema
>

export const prooflineizabilityRolloutResponseSchema = z.object({
  status: prooflineizabilityRolloutStatusSchema,
  checks: z.array(prooflineizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ProoflineizabilityRolloutResponse = z.infer<
  typeof prooflineizabilityRolloutResponseSchema
>

export function getProoflineizabilityRolloutGuidance() {
  return 'Production prooflineizability rollout validates shield scan prooflineizability, provider credential prooflineizability signals, billing webhook coverage, and reconciliationization readiness before production prooflineizability tooling.'
}
