import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const bluegreenizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type BluegreenizabilityRolloutCheckStatus = z.infer<
  typeof bluegreenizabilityRolloutCheckStatusSchema
>

export const bluegreenizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: bluegreenizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type BluegreenizabilityRolloutCheck = z.infer<typeof bluegreenizabilityRolloutCheckSchema>

export const bluegreenizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type BluegreenizabilityRolloutStatus = z.infer<typeof bluegreenizabilityRolloutStatusSchema>

export const bluegreenizabilityCapabilitiesResponseSchema = z.object({
  supportsBluegreenizabilityRollout: z.literal(true),
  supportsBluegreenizabilityAdminTools: z.literal(true),
  supportsWorkspaceLimitBluegreenizabilitySignals: z.literal(true),
  supportsUsageEventBluegreenizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type BluegreenizabilityCapabilitiesResponse = z.infer<
  typeof bluegreenizabilityCapabilitiesResponseSchema
>

export const bluegreenizabilityRolloutResponseSchema = z.object({
  status: bluegreenizabilityRolloutStatusSchema,
  checks: z.array(bluegreenizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type BluegreenizabilityRolloutResponse = z.infer<
  typeof bluegreenizabilityRolloutResponseSchema
>

export function getBluegreenizabilityRolloutGuidance() {
  return 'Production bluegreenizability rollout validates workspace limit bluegreenizability, usage event bluegreenizability signals, billing record coverage, and bluegreenization readiness before production bluegreenizability tooling.'
}
