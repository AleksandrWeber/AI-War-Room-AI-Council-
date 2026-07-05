import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const cacheizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type CacheizabilityRolloutCheckStatus = z.infer<
  typeof cacheizabilityRolloutCheckStatusSchema
>

export const cacheizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: cacheizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type CacheizabilityRolloutCheck = z.infer<typeof cacheizabilityRolloutCheckSchema>

export const cacheizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type CacheizabilityRolloutStatus = z.infer<typeof cacheizabilityRolloutStatusSchema>

export const cacheizabilityCapabilitiesResponseSchema = z.object({
  supportsCacheizabilityRollout: z.literal(true),
  supportsCacheizabilityAdminTools: z.literal(true),
  supportsModelHealthCacheizabilitySignals: z.literal(true),
  supportsModelRegistryCacheizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type CacheizabilityCapabilitiesResponse = z.infer<
  typeof cacheizabilityCapabilitiesResponseSchema
>

export const cacheizabilityRolloutResponseSchema = z.object({
  status: cacheizabilityRolloutStatusSchema,
  checks: z.array(cacheizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type CacheizabilityRolloutResponse = z.infer<
  typeof cacheizabilityRolloutResponseSchema
>

export function getCacheizabilityRolloutGuidance() {
  return 'Production cacheizability rollout validates model health cacheizability, model registry cacheizability signals, billing record coverage, and optimization readiness before production cacheizability tooling.'
}
