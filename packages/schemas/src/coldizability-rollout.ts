import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const coldizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ColdizabilityRolloutCheckStatus = z.infer<
  typeof coldizabilityRolloutCheckStatusSchema
>

export const coldizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: coldizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ColdizabilityRolloutCheck = z.infer<typeof coldizabilityRolloutCheckSchema>

export const coldizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ColdizabilityRolloutStatus = z.infer<typeof coldizabilityRolloutStatusSchema>

export const coldizabilityCapabilitiesResponseSchema = z.object({
  supportsColdizabilityRollout: z.literal(true),
  supportsColdizabilityAdminTools: z.literal(true),
  supportsWorkspaceLimitColdizabilitySignals: z.literal(true),
  supportsUsageEventColdizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ColdizabilityCapabilitiesResponse = z.infer<
  typeof coldizabilityCapabilitiesResponseSchema
>

export const coldizabilityRolloutResponseSchema = z.object({
  status: coldizabilityRolloutStatusSchema,
  checks: z.array(coldizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ColdizabilityRolloutResponse = z.infer<
  typeof coldizabilityRolloutResponseSchema
>

export function getColdizabilityRolloutGuidance() {
  return 'Production coldizability rollout validates workspace limit coldizability, usage event coldizability signals, billing record coverage, and coldization readiness before production coldizability tooling.'
}
