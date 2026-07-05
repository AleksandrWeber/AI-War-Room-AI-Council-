import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const prefetchizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type PrefetchizabilityRolloutCheckStatus = z.infer<
  typeof prefetchizabilityRolloutCheckStatusSchema
>

export const prefetchizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: prefetchizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type PrefetchizabilityRolloutCheck = z.infer<typeof prefetchizabilityRolloutCheckSchema>

export const prefetchizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type PrefetchizabilityRolloutStatus = z.infer<typeof prefetchizabilityRolloutStatusSchema>

export const prefetchizabilityCapabilitiesResponseSchema = z.object({
  supportsPrefetchizabilityRollout: z.literal(true),
  supportsPrefetchizabilityAdminTools: z.literal(true),
  supportsProviderCredentialPrefetchizabilitySignals: z.literal(true),
  supportsModelRegistryPrefetchizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type PrefetchizabilityCapabilitiesResponse = z.infer<
  typeof prefetchizabilityCapabilitiesResponseSchema
>

export const prefetchizabilityRolloutResponseSchema = z.object({
  status: prefetchizabilityRolloutStatusSchema,
  checks: z.array(prefetchizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type PrefetchizabilityRolloutResponse = z.infer<
  typeof prefetchizabilityRolloutResponseSchema
>

export function getPrefetchizabilityRolloutGuidance() {
  return 'Production prefetchizability rollout validates provider credential prefetchizability, model registry prefetchizability signals, billing webhook coverage, and prefetchization readiness before production prefetchizability tooling.'
}
