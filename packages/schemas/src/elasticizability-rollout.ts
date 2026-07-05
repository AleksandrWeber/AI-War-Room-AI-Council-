import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const elasticizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ElasticizabilityRolloutCheckStatus = z.infer<
  typeof elasticizabilityRolloutCheckStatusSchema
>

export const elasticizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: elasticizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ElasticizabilityRolloutCheck = z.infer<typeof elasticizabilityRolloutCheckSchema>

export const elasticizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ElasticizabilityRolloutStatus = z.infer<typeof elasticizabilityRolloutStatusSchema>

export const elasticizabilityCapabilitiesResponseSchema = z.object({
  supportsElasticizabilityRollout: z.literal(true),
  supportsElasticizabilityAdminTools: z.literal(true),
  supportsIdempotencyKeyElasticizabilitySignals: z.literal(true),
  supportsUsageEventElasticizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ElasticizabilityCapabilitiesResponse = z.infer<
  typeof elasticizabilityCapabilitiesResponseSchema
>

export const elasticizabilityRolloutResponseSchema = z.object({
  status: elasticizabilityRolloutStatusSchema,
  checks: z.array(elasticizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ElasticizabilityRolloutResponse = z.infer<
  typeof elasticizabilityRolloutResponseSchema
>

export function getElasticizabilityRolloutGuidance() {
  return 'Production elasticizability rollout validates idempotency key elasticizability, usage event elasticizability signals, billing webhook coverage, and elasticization readiness before production elasticizability tooling.'
}
