import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const modifiabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ModifiabilityRolloutCheckStatus = z.infer<
  typeof modifiabilityRolloutCheckStatusSchema
>

export const modifiabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: modifiabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ModifiabilityRolloutCheck = z.infer<typeof modifiabilityRolloutCheckSchema>

export const modifiabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ModifiabilityRolloutStatus = z.infer<typeof modifiabilityRolloutStatusSchema>

export const modifiabilityCapabilitiesResponseSchema = z.object({
  supportsModifiabilityRollout: z.literal(true),
  supportsModifiabilityAdminTools: z.literal(true),
  supportsIdempotencyKeyModifiabilitySignals: z.literal(true),
  supportsBillingRecordModifiabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ModifiabilityCapabilitiesResponse = z.infer<
  typeof modifiabilityCapabilitiesResponseSchema
>

export const modifiabilityRolloutResponseSchema = z.object({
  status: modifiabilityRolloutStatusSchema,
  checks: z.array(modifiabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ModifiabilityRolloutResponse = z.infer<
  typeof modifiabilityRolloutResponseSchema
>

export function getModifiabilityRolloutGuidance() {
  return 'Production modifiability rollout validates idempotency key modifiability, billing record modifiability signals, workspace membership coverage, and modification readiness before production modifiability tooling.'
}
