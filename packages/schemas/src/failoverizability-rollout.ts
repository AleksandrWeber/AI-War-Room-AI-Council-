import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const failoverizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type FailoverizabilityRolloutCheckStatus = z.infer<
  typeof failoverizabilityRolloutCheckStatusSchema
>

export const failoverizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: failoverizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type FailoverizabilityRolloutCheck = z.infer<typeof failoverizabilityRolloutCheckSchema>

export const failoverizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type FailoverizabilityRolloutStatus = z.infer<typeof failoverizabilityRolloutStatusSchema>

export const failoverizabilityCapabilitiesResponseSchema = z.object({
  supportsFailoverizabilityRollout: z.literal(true),
  supportsFailoverizabilityAdminTools: z.literal(true),
  supportsWorkspaceLimitFailoverizabilitySignals: z.literal(true),
  supportsUsageEventFailoverizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type FailoverizabilityCapabilitiesResponse = z.infer<
  typeof failoverizabilityCapabilitiesResponseSchema
>

export const failoverizabilityRolloutResponseSchema = z.object({
  status: failoverizabilityRolloutStatusSchema,
  checks: z.array(failoverizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type FailoverizabilityRolloutResponse = z.infer<
  typeof failoverizabilityRolloutResponseSchema
>

export function getFailoverizabilityRolloutGuidance() {
  return 'Production failoverizability rollout validates workspace limit failoverizability, usage event failoverizability signals, billing record coverage, and failoverization readiness before production failoverizability tooling.'
}
