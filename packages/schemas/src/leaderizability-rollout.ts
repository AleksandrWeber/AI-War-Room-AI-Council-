import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const leaderizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type LeaderizabilityRolloutCheckStatus = z.infer<
  typeof leaderizabilityRolloutCheckStatusSchema
>

export const leaderizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: leaderizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type LeaderizabilityRolloutCheck = z.infer<typeof leaderizabilityRolloutCheckSchema>

export const leaderizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type LeaderizabilityRolloutStatus = z.infer<typeof leaderizabilityRolloutStatusSchema>

export const leaderizabilityCapabilitiesResponseSchema = z.object({
  supportsLeaderizabilityRollout: z.literal(true),
  supportsLeaderizabilityAdminTools: z.literal(true),
  supportsWorkspaceLimitLeaderizabilitySignals: z.literal(true),
  supportsUsageEventLeaderizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type LeaderizabilityCapabilitiesResponse = z.infer<
  typeof leaderizabilityCapabilitiesResponseSchema
>

export const leaderizabilityRolloutResponseSchema = z.object({
  status: leaderizabilityRolloutStatusSchema,
  checks: z.array(leaderizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type LeaderizabilityRolloutResponse = z.infer<
  typeof leaderizabilityRolloutResponseSchema
>

export function getLeaderizabilityRolloutGuidance() {
  return 'Production leaderizability rollout validates workspace limit leaderizability, usage event leaderizability signals, billing record coverage, and leaderization readiness before production leaderizability tooling.'
}
