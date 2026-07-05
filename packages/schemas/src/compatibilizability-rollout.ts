import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const compatibilizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type CompatibilizabilityRolloutCheckStatus = z.infer<
  typeof compatibilizabilityRolloutCheckStatusSchema
>

export const compatibilizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: compatibilizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type CompatibilizabilityRolloutCheck = z.infer<typeof compatibilizabilityRolloutCheckSchema>

export const compatibilizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type CompatibilizabilityRolloutStatus = z.infer<typeof compatibilizabilityRolloutStatusSchema>

export const compatibilizabilityCapabilitiesResponseSchema = z.object({
  supportsCompatibilizabilityRollout: z.literal(true),
  supportsCompatibilizabilityAdminTools: z.literal(true),
  supportsBillingWebhookCompatibilizabilitySignals: z.literal(true),
  supportsBillingRecordCompatibilizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type CompatibilizabilityCapabilitiesResponse = z.infer<
  typeof compatibilizabilityCapabilitiesResponseSchema
>

export const compatibilizabilityRolloutResponseSchema = z.object({
  status: compatibilizabilityRolloutStatusSchema,
  checks: z.array(compatibilizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type CompatibilizabilityRolloutResponse = z.infer<
  typeof compatibilizabilityRolloutResponseSchema
>

export function getCompatibilizabilityRolloutGuidance() {
  return 'Production compatibilizability rollout validates billing webhook compatibilizability, billing record compatibilizability signals, usage event coverage, and interpolation readiness before production compatibilizability tooling.'
}
