import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const unicastizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type UnicastizabilityRolloutCheckStatus = z.infer<
  typeof unicastizabilityRolloutCheckStatusSchema
>

export const unicastizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: unicastizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type UnicastizabilityRolloutCheck = z.infer<typeof unicastizabilityRolloutCheckSchema>

export const unicastizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type UnicastizabilityRolloutStatus = z.infer<typeof unicastizabilityRolloutStatusSchema>

export const unicastizabilityCapabilitiesResponseSchema = z.object({
  supportsUnicastizabilityRollout: z.literal(true),
  supportsUnicastizabilityAdminTools: z.literal(true),
  supportsBillingWebhookUnicastizabilitySignals: z.literal(true),
  supportsBillingRecordUnicastizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type UnicastizabilityCapabilitiesResponse = z.infer<
  typeof unicastizabilityCapabilitiesResponseSchema
>

export const unicastizabilityRolloutResponseSchema = z.object({
  status: unicastizabilityRolloutStatusSchema,
  checks: z.array(unicastizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type UnicastizabilityRolloutResponse = z.infer<
  typeof unicastizabilityRolloutResponseSchema
>

export function getUnicastizabilityRolloutGuidance() {
  return 'Production unicastizability rollout validates billing webhook unicastizability, billing record unicastizability signals, usage event coverage, and interpolation readiness before production unicastizability tooling.'
}
