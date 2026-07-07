import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const leastprivilegeizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type LeastprivilegeizabilityRolloutCheckStatus = z.infer<
  typeof leastprivilegeizabilityRolloutCheckStatusSchema
>

export const leastprivilegeizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: leastprivilegeizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type LeastprivilegeizabilityRolloutCheck = z.infer<typeof leastprivilegeizabilityRolloutCheckSchema>

export const leastprivilegeizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type LeastprivilegeizabilityRolloutStatus = z.infer<typeof leastprivilegeizabilityRolloutStatusSchema>

export const leastprivilegeizabilityCapabilitiesResponseSchema = z.object({
  supportsLeastprivilegeizabilityRollout: z.literal(true),
  supportsLeastprivilegeizabilityAdminTools: z.literal(true),
  supportsShieldScanLeastprivilegeizabilitySignals: z.literal(true),
  supportsProviderCredentialLeastprivilegeizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type LeastprivilegeizabilityCapabilitiesResponse = z.infer<
  typeof leastprivilegeizabilityCapabilitiesResponseSchema
>

export const leastprivilegeizabilityRolloutResponseSchema = z.object({
  status: leastprivilegeizabilityRolloutStatusSchema,
  checks: z.array(leastprivilegeizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type LeastprivilegeizabilityRolloutResponse = z.infer<
  typeof leastprivilegeizabilityRolloutResponseSchema
>

export function getLeastprivilegeizabilityRolloutGuidance() {
  return 'Production leastprivilegeizability rollout validates shield scan leastprivilegeizability, provider credential leastprivilegeizability signals, billing webhook coverage, and reconciliationization readiness before production leastprivilegeizability tooling.'
}
