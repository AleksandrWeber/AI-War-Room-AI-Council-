import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const queryizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type QueryizabilityRolloutCheckStatus = z.infer<
  typeof queryizabilityRolloutCheckStatusSchema
>

export const queryizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: queryizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type QueryizabilityRolloutCheck = z.infer<typeof queryizabilityRolloutCheckSchema>

export const queryizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type QueryizabilityRolloutStatus = z.infer<typeof queryizabilityRolloutStatusSchema>

export const queryizabilityCapabilitiesResponseSchema = z.object({
  supportsQueryizabilityRollout: z.literal(true),
  supportsQueryizabilityAdminTools: z.literal(true),
  supportsBillingWebhookQueryizabilitySignals: z.literal(true),
  supportsBillingRecordQueryizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type QueryizabilityCapabilitiesResponse = z.infer<
  typeof queryizabilityCapabilitiesResponseSchema
>

export const queryizabilityRolloutResponseSchema = z.object({
  status: queryizabilityRolloutStatusSchema,
  checks: z.array(queryizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type QueryizabilityRolloutResponse = z.infer<
  typeof queryizabilityRolloutResponseSchema
>

export function getQueryizabilityRolloutGuidance() {
  return 'Production queryizability rollout validates billing webhook queryizability, billing record queryizability signals, usage event coverage, and interpolation readiness before production queryizability tooling.'
}
