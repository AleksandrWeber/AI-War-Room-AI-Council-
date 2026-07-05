import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const abstractizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type AbstractizabilityRolloutCheckStatus = z.infer<
  typeof abstractizabilityRolloutCheckStatusSchema
>

export const abstractizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: abstractizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type AbstractizabilityRolloutCheck = z.infer<typeof abstractizabilityRolloutCheckSchema>

export const abstractizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type AbstractizabilityRolloutStatus = z.infer<typeof abstractizabilityRolloutStatusSchema>

export const abstractizabilityCapabilitiesResponseSchema = z.object({
  supportsAbstractizabilityRollout: z.literal(true),
  supportsAbstractizabilityAdminTools: z.literal(true),
  supportsShieldScanAbstractizabilitySignals: z.literal(true),
  supportsProviderCredentialAbstractizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type AbstractizabilityCapabilitiesResponse = z.infer<
  typeof abstractizabilityCapabilitiesResponseSchema
>

export const abstractizabilityRolloutResponseSchema = z.object({
  status: abstractizabilityRolloutStatusSchema,
  checks: z.array(abstractizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type AbstractizabilityRolloutResponse = z.infer<
  typeof abstractizabilityRolloutResponseSchema
>

export function getAbstractizabilityRolloutGuidance() {
  return 'Production abstractizability rollout validates shield scan abstractizability, provider credential abstractizability signals, billing webhook coverage, and abstractization readiness before production abstractizability tooling.'
}
