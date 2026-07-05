import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const marketabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type MarketabilityRolloutCheckStatus = z.infer<
  typeof marketabilityRolloutCheckStatusSchema
>

export const marketabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: marketabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type MarketabilityRolloutCheck = z.infer<typeof marketabilityRolloutCheckSchema>

export const marketabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type MarketabilityRolloutStatus = z.infer<typeof marketabilityRolloutStatusSchema>

export const marketabilityCapabilitiesResponseSchema = z.object({
  supportsMarketabilityRollout: z.literal(true),
  supportsMarketabilityAdminTools: z.literal(true),
  supportsMembershipMarketabilitySignals: z.literal(true),
  supportsMeterUsageMarketabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type MarketabilityCapabilitiesResponse = z.infer<
  typeof marketabilityCapabilitiesResponseSchema
>

export const marketabilityRolloutResponseSchema = z.object({
  status: marketabilityRolloutStatusSchema,
  checks: z.array(marketabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type MarketabilityRolloutResponse = z.infer<
  typeof marketabilityRolloutResponseSchema
>

export function getMarketabilityRolloutGuidance() {
  return 'Production marketability rollout validates membership marketability, meter usage marketability signals, usage event coverage, and marketability readiness before production marketability tooling.'
}
