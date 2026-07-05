import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const transformizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type TransformizabilityRolloutCheckStatus = z.infer<
  typeof transformizabilityRolloutCheckStatusSchema
>

export const transformizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: transformizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type TransformizabilityRolloutCheck = z.infer<typeof transformizabilityRolloutCheckSchema>

export const transformizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type TransformizabilityRolloutStatus = z.infer<typeof transformizabilityRolloutStatusSchema>

export const transformizabilityCapabilitiesResponseSchema = z.object({
  supportsTransformizabilityRollout: z.literal(true),
  supportsTransformizabilityAdminTools: z.literal(true),
  supportsBillingWebhookTransformizabilitySignals: z.literal(true),
  supportsBillingRecordTransformizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type TransformizabilityCapabilitiesResponse = z.infer<
  typeof transformizabilityCapabilitiesResponseSchema
>

export const transformizabilityRolloutResponseSchema = z.object({
  status: transformizabilityRolloutStatusSchema,
  checks: z.array(transformizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type TransformizabilityRolloutResponse = z.infer<
  typeof transformizabilityRolloutResponseSchema
>

export function getTransformizabilityRolloutGuidance() {
  return 'Production transformizability rollout validates billing webhook transformizability, billing record transformizability signals, usage event coverage, and interpolation readiness before production transformizability tooling.'
}
