import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const contextualizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ContextualizabilityRolloutCheckStatus = z.infer<
  typeof contextualizabilityRolloutCheckStatusSchema
>

export const contextualizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: contextualizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ContextualizabilityRolloutCheck = z.infer<typeof contextualizabilityRolloutCheckSchema>

export const contextualizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ContextualizabilityRolloutStatus = z.infer<typeof contextualizabilityRolloutStatusSchema>

export const contextualizabilityCapabilitiesResponseSchema = z.object({
  supportsContextualizabilityRollout: z.literal(true),
  supportsContextualizabilityAdminTools: z.literal(true),
  supportsBillingWebhookContextualizabilitySignals: z.literal(true),
  supportsBillingRecordContextualizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ContextualizabilityCapabilitiesResponse = z.infer<
  typeof contextualizabilityCapabilitiesResponseSchema
>

export const contextualizabilityRolloutResponseSchema = z.object({
  status: contextualizabilityRolloutStatusSchema,
  checks: z.array(contextualizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ContextualizabilityRolloutResponse = z.infer<
  typeof contextualizabilityRolloutResponseSchema
>

export function getContextualizabilityRolloutGuidance() {
  return 'Production contextualizability rollout validates billing webhook contextualizability, billing record contextualizability signals, usage event coverage, and contextualization readiness before production contextualizability tooling.'
}
