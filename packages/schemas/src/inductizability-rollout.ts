import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const inductizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type InductizabilityRolloutCheckStatus = z.infer<
  typeof inductizabilityRolloutCheckStatusSchema
>

export const inductizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: inductizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type InductizabilityRolloutCheck = z.infer<typeof inductizabilityRolloutCheckSchema>

export const inductizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type InductizabilityRolloutStatus = z.infer<typeof inductizabilityRolloutStatusSchema>

export const inductizabilityCapabilitiesResponseSchema = z.object({
  supportsInductizabilityRollout: z.literal(true),
  supportsInductizabilityAdminTools: z.literal(true),
  supportsShieldScanInductizabilitySignals: z.literal(true),
  supportsProviderCredentialInductizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type InductizabilityCapabilitiesResponse = z.infer<
  typeof inductizabilityCapabilitiesResponseSchema
>

export const inductizabilityRolloutResponseSchema = z.object({
  status: inductizabilityRolloutStatusSchema,
  checks: z.array(inductizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type InductizabilityRolloutResponse = z.infer<
  typeof inductizabilityRolloutResponseSchema
>

export function getInductizabilityRolloutGuidance() {
  return 'Production inductizability rollout validates shield scan inductizability, provider credential inductizability signals, billing webhook coverage, and inductization readiness before production inductizability tooling.'
}
