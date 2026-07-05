import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const aggregatizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type AggregatizabilityRolloutCheckStatus = z.infer<
  typeof aggregatizabilityRolloutCheckStatusSchema
>

export const aggregatizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: aggregatizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type AggregatizabilityRolloutCheck = z.infer<typeof aggregatizabilityRolloutCheckSchema>

export const aggregatizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type AggregatizabilityRolloutStatus = z.infer<typeof aggregatizabilityRolloutStatusSchema>

export const aggregatizabilityCapabilitiesResponseSchema = z.object({
  supportsAggregatizabilityRollout: z.literal(true),
  supportsAggregatizabilityAdminTools: z.literal(true),
  supportsProviderCredentialAggregatizabilitySignals: z.literal(true),
  supportsModelRegistryAggregatizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type AggregatizabilityCapabilitiesResponse = z.infer<
  typeof aggregatizabilityCapabilitiesResponseSchema
>

export const aggregatizabilityRolloutResponseSchema = z.object({
  status: aggregatizabilityRolloutStatusSchema,
  checks: z.array(aggregatizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type AggregatizabilityRolloutResponse = z.infer<
  typeof aggregatizabilityRolloutResponseSchema
>

export function getAggregatizabilityRolloutGuidance() {
  return 'Production aggregatizability rollout validates provider credential aggregatizability, model registry aggregatizability signals, billing webhook coverage, and aggregatization readiness before production aggregatizability tooling.'
}
