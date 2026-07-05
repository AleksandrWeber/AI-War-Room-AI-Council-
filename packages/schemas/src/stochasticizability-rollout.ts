import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const stochasticizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type StochasticizabilityRolloutCheckStatus = z.infer<
  typeof stochasticizabilityRolloutCheckStatusSchema
>

export const stochasticizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: stochasticizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type StochasticizabilityRolloutCheck = z.infer<typeof stochasticizabilityRolloutCheckSchema>

export const stochasticizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type StochasticizabilityRolloutStatus = z.infer<typeof stochasticizabilityRolloutStatusSchema>

export const stochasticizabilityCapabilitiesResponseSchema = z.object({
  supportsStochasticizabilityRollout: z.literal(true),
  supportsStochasticizabilityAdminTools: z.literal(true),
  supportsMeterUsageStochasticizabilitySignals: z.literal(true),
  supportsUsageEventStochasticizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type StochasticizabilityCapabilitiesResponse = z.infer<
  typeof stochasticizabilityCapabilitiesResponseSchema
>

export const stochasticizabilityRolloutResponseSchema = z.object({
  status: stochasticizabilityRolloutStatusSchema,
  checks: z.array(stochasticizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type StochasticizabilityRolloutResponse = z.infer<
  typeof stochasticizabilityRolloutResponseSchema
>

export function getStochasticizabilityRolloutGuidance() {
  return 'Production stochasticizability rollout validates meter usage stochasticizability, usage event stochasticizability signals, workspace limit coverage, and stochasticization readiness before production stochasticizability tooling.'
}
