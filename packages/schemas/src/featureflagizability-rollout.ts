import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const featureflagizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type FeatureflagizabilityRolloutCheckStatus = z.infer<
  typeof featureflagizabilityRolloutCheckStatusSchema
>

export const featureflagizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: featureflagizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type FeatureflagizabilityRolloutCheck = z.infer<typeof featureflagizabilityRolloutCheckSchema>

export const featureflagizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type FeatureflagizabilityRolloutStatus = z.infer<typeof featureflagizabilityRolloutStatusSchema>

export const featureflagizabilityCapabilitiesResponseSchema = z.object({
  supportsFeatureflagizabilityRollout: z.literal(true),
  supportsFeatureflagizabilityAdminTools: z.literal(true),
  supportsModelHealthFeatureflagizabilitySignals: z.literal(true),
  supportsModelRegistryFeatureflagizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type FeatureflagizabilityCapabilitiesResponse = z.infer<
  typeof featureflagizabilityCapabilitiesResponseSchema
>

export const featureflagizabilityRolloutResponseSchema = z.object({
  status: featureflagizabilityRolloutStatusSchema,
  checks: z.array(featureflagizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type FeatureflagizabilityRolloutResponse = z.infer<
  typeof featureflagizabilityRolloutResponseSchema
>

export function getFeatureflagizabilityRolloutGuidance() {
  return 'Production featureflagizability rollout validates model health featureflagizability, model registry featureflagizability signals, billing record coverage, and optimization readiness before production featureflagizability tooling.'
}
