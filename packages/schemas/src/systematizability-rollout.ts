import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const systematizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type SystematizabilityRolloutCheckStatus = z.infer<
  typeof systematizabilityRolloutCheckStatusSchema
>

export const systematizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: systematizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type SystematizabilityRolloutCheck = z.infer<typeof systematizabilityRolloutCheckSchema>

export const systematizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type SystematizabilityRolloutStatus = z.infer<typeof systematizabilityRolloutStatusSchema>

export const systematizabilityCapabilitiesResponseSchema = z.object({
  supportsSystematizabilityRollout: z.literal(true),
  supportsSystematizabilityAdminTools: z.literal(true),
  supportsBillingWebhookSystematizabilitySignals: z.literal(true),
  supportsBillingRecordSystematizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type SystematizabilityCapabilitiesResponse = z.infer<
  typeof systematizabilityCapabilitiesResponseSchema
>

export const systematizabilityRolloutResponseSchema = z.object({
  status: systematizabilityRolloutStatusSchema,
  checks: z.array(systematizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type SystematizabilityRolloutResponse = z.infer<
  typeof systematizabilityRolloutResponseSchema
>

export function getSystematizabilityRolloutGuidance() {
  return 'Production systematizability rollout validates billing webhook systematizability, billing record systematizability signals, usage event coverage, and systematization readiness before production systematizability tooling.'
}
