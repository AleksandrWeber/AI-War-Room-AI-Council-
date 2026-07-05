import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const hydrationizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type HydrationizabilityRolloutCheckStatus = z.infer<
  typeof hydrationizabilityRolloutCheckStatusSchema
>

export const hydrationizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: hydrationizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type HydrationizabilityRolloutCheck = z.infer<typeof hydrationizabilityRolloutCheckSchema>

export const hydrationizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type HydrationizabilityRolloutStatus = z.infer<typeof hydrationizabilityRolloutStatusSchema>

export const hydrationizabilityCapabilitiesResponseSchema = z.object({
  supportsHydrationizabilityRollout: z.literal(true),
  supportsHydrationizabilityAdminTools: z.literal(true),
  supportsShieldScanHydrationizabilitySignals: z.literal(true),
  supportsProviderCredentialHydrationizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type HydrationizabilityCapabilitiesResponse = z.infer<
  typeof hydrationizabilityCapabilitiesResponseSchema
>

export const hydrationizabilityRolloutResponseSchema = z.object({
  status: hydrationizabilityRolloutStatusSchema,
  checks: z.array(hydrationizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type HydrationizabilityRolloutResponse = z.infer<
  typeof hydrationizabilityRolloutResponseSchema
>

export function getHydrationizabilityRolloutGuidance() {
  return 'Production hydrationizability rollout validates shield scan hydrationizability, provider credential hydrationizability signals, billing webhook coverage, and hydrationization readiness before production hydrationizability tooling.'
}
