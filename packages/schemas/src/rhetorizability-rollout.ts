import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const rhetorizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type RhetorizabilityRolloutCheckStatus = z.infer<
  typeof rhetorizabilityRolloutCheckStatusSchema
>

export const rhetorizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: rhetorizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type RhetorizabilityRolloutCheck = z.infer<typeof rhetorizabilityRolloutCheckSchema>

export const rhetorizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type RhetorizabilityRolloutStatus = z.infer<typeof rhetorizabilityRolloutStatusSchema>

export const rhetorizabilityCapabilitiesResponseSchema = z.object({
  supportsRhetorizabilityRollout: z.literal(true),
  supportsRhetorizabilityAdminTools: z.literal(true),
  supportsMeterUsageRhetorizabilitySignals: z.literal(true),
  supportsUsageEventRhetorizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type RhetorizabilityCapabilitiesResponse = z.infer<
  typeof rhetorizabilityCapabilitiesResponseSchema
>

export const rhetorizabilityRolloutResponseSchema = z.object({
  status: rhetorizabilityRolloutStatusSchema,
  checks: z.array(rhetorizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type RhetorizabilityRolloutResponse = z.infer<
  typeof rhetorizabilityRolloutResponseSchema
>

export function getRhetorizabilityRolloutGuidance() {
  return 'Production rhetorizability rollout validates meter usage rhetorizability, usage event rhetorizability signals, workspace limit coverage, and rhetorization readiness before production rhetorizability tooling.'
}
