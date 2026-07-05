import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const standardizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type StandardizabilityRolloutCheckStatus = z.infer<
  typeof standardizabilityRolloutCheckStatusSchema
>

export const standardizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: standardizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type StandardizabilityRolloutCheck = z.infer<typeof standardizabilityRolloutCheckSchema>

export const standardizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type StandardizabilityRolloutStatus = z.infer<typeof standardizabilityRolloutStatusSchema>

export const standardizabilityCapabilitiesResponseSchema = z.object({
  supportsStandardizabilityRollout: z.literal(true),
  supportsStandardizabilityAdminTools: z.literal(true),
  supportsWorkspaceLimitStandardizabilitySignals: z.literal(true),
  supportsUsageEventStandardizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type StandardizabilityCapabilitiesResponse = z.infer<
  typeof standardizabilityCapabilitiesResponseSchema
>

export const standardizabilityRolloutResponseSchema = z.object({
  status: standardizabilityRolloutStatusSchema,
  checks: z.array(standardizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type StandardizabilityRolloutResponse = z.infer<
  typeof standardizabilityRolloutResponseSchema
>

export function getStandardizabilityRolloutGuidance() {
  return 'Production standardizability rollout validates workspace limit standardizability, usage event standardizability signals, billing record coverage, and standardization readiness before production standardizability tooling.'
}
