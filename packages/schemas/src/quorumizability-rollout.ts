import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const quorumizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type QuorumizabilityRolloutCheckStatus = z.infer<
  typeof quorumizabilityRolloutCheckStatusSchema
>

export const quorumizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: quorumizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type QuorumizabilityRolloutCheck = z.infer<typeof quorumizabilityRolloutCheckSchema>

export const quorumizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type QuorumizabilityRolloutStatus = z.infer<typeof quorumizabilityRolloutStatusSchema>

export const quorumizabilityCapabilitiesResponseSchema = z.object({
  supportsQuorumizabilityRollout: z.literal(true),
  supportsQuorumizabilityAdminTools: z.literal(true),
  supportsShieldScanQuorumizabilitySignals: z.literal(true),
  supportsProviderCredentialQuorumizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type QuorumizabilityCapabilitiesResponse = z.infer<
  typeof quorumizabilityCapabilitiesResponseSchema
>

export const quorumizabilityRolloutResponseSchema = z.object({
  status: quorumizabilityRolloutStatusSchema,
  checks: z.array(quorumizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type QuorumizabilityRolloutResponse = z.infer<
  typeof quorumizabilityRolloutResponseSchema
>

export function getQuorumizabilityRolloutGuidance() {
  return 'Production quorumizability rollout validates shield scan quorumizability, provider credential quorumizability signals, billing webhook coverage, and quorumization readiness before production quorumizability tooling.'
}
