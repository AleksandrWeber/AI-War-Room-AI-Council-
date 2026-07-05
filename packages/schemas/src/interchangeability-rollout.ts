import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const interchangeabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type InterchangeabilityRolloutCheckStatus = z.infer<
  typeof interchangeabilityRolloutCheckStatusSchema
>

export const interchangeabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: interchangeabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type InterchangeabilityRolloutCheck = z.infer<typeof interchangeabilityRolloutCheckSchema>

export const interchangeabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type InterchangeabilityRolloutStatus = z.infer<typeof interchangeabilityRolloutStatusSchema>

export const interchangeabilityCapabilitiesResponseSchema = z.object({
  supportsInterchangeabilityRollout: z.literal(true),
  supportsInterchangeabilityAdminTools: z.literal(true),
  supportsMeterUsageInterchangeabilitySignals: z.literal(true),
  supportsIdempotencyKeyInterchangeabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type InterchangeabilityCapabilitiesResponse = z.infer<
  typeof interchangeabilityCapabilitiesResponseSchema
>

export const interchangeabilityRolloutResponseSchema = z.object({
  status: interchangeabilityRolloutStatusSchema,
  checks: z.array(interchangeabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type InterchangeabilityRolloutResponse = z.infer<
  typeof interchangeabilityRolloutResponseSchema
>

export function getInterchangeabilityRolloutGuidance() {
  return 'Production interchangeability rollout validates meter usage interchangeability, idempotency key interchangeability signals, workspace limit coverage, and interchange readiness before production interchangeability tooling.'
}
