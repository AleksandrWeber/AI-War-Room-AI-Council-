import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const controllabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ControllabilityRolloutCheckStatus = z.infer<
  typeof controllabilityRolloutCheckStatusSchema
>

export const controllabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: controllabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ControllabilityRolloutCheck = z.infer<typeof controllabilityRolloutCheckSchema>

export const controllabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ControllabilityRolloutStatus = z.infer<typeof controllabilityRolloutStatusSchema>

export const controllabilityCapabilitiesResponseSchema = z.object({
  supportsControllabilityRollout: z.literal(true),
  supportsControllabilityAdminTools: z.literal(true),
  supportsIdempotencyKeyControllabilitySignals: z.literal(true),
  supportsWorkspaceLimitControllabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ControllabilityCapabilitiesResponse = z.infer<
  typeof controllabilityCapabilitiesResponseSchema
>

export const controllabilityRolloutResponseSchema = z.object({
  status: controllabilityRolloutStatusSchema,
  checks: z.array(controllabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ControllabilityRolloutResponse = z.infer<
  typeof controllabilityRolloutResponseSchema
>

export function getControllabilityRolloutGuidance() {
  return 'Production controllability rollout validates idempotency key controllability, workspace limit controllability signals, usage event coverage, and control readiness before production controllability tooling.'
}
