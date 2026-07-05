import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const deadletterizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type DeadletterizabilityRolloutCheckStatus = z.infer<
  typeof deadletterizabilityRolloutCheckStatusSchema
>

export const deadletterizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: deadletterizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type DeadletterizabilityRolloutCheck = z.infer<typeof deadletterizabilityRolloutCheckSchema>

export const deadletterizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type DeadletterizabilityRolloutStatus = z.infer<typeof deadletterizabilityRolloutStatusSchema>

export const deadletterizabilityCapabilitiesResponseSchema = z.object({
  supportsDeadletterizabilityRollout: z.literal(true),
  supportsDeadletterizabilityAdminTools: z.literal(true),
  supportsWorkspaceLimitDeadletterizabilitySignals: z.literal(true),
  supportsUsageEventDeadletterizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type DeadletterizabilityCapabilitiesResponse = z.infer<
  typeof deadletterizabilityCapabilitiesResponseSchema
>

export const deadletterizabilityRolloutResponseSchema = z.object({
  status: deadletterizabilityRolloutStatusSchema,
  checks: z.array(deadletterizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type DeadletterizabilityRolloutResponse = z.infer<
  typeof deadletterizabilityRolloutResponseSchema
>

export function getDeadletterizabilityRolloutGuidance() {
  return 'Production deadletterizability rollout validates workspace limit deadletterizability, usage event deadletterizability signals, billing record coverage, and deadletterization readiness before production deadletterizability tooling.'
}
