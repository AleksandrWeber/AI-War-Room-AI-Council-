import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const recoverizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type RecoverizabilityRolloutCheckStatus = z.infer<
  typeof recoverizabilityRolloutCheckStatusSchema
>

export const recoverizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: recoverizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type RecoverizabilityRolloutCheck = z.infer<typeof recoverizabilityRolloutCheckSchema>

export const recoverizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type RecoverizabilityRolloutStatus = z.infer<typeof recoverizabilityRolloutStatusSchema>

export const recoverizabilityCapabilitiesResponseSchema = z.object({
  supportsRecoverizabilityRollout: z.literal(true),
  supportsRecoverizabilityAdminTools: z.literal(true),
  supportsBillingWebhookRecoverizabilitySignals: z.literal(true),
  supportsBillingRecordRecoverizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type RecoverizabilityCapabilitiesResponse = z.infer<
  typeof recoverizabilityCapabilitiesResponseSchema
>

export const recoverizabilityRolloutResponseSchema = z.object({
  status: recoverizabilityRolloutStatusSchema,
  checks: z.array(recoverizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type RecoverizabilityRolloutResponse = z.infer<
  typeof recoverizabilityRolloutResponseSchema
>

export function getRecoverizabilityRolloutGuidance() {
  return 'Production recoverizability rollout validates billing webhook recoverizability, billing record recoverizability signals, usage event coverage, and interpolation readiness before production recoverizability tooling.'
}
