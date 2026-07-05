import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const parametrizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ParametrizabilityRolloutCheckStatus = z.infer<
  typeof parametrizabilityRolloutCheckStatusSchema
>

export const parametrizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: parametrizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ParametrizabilityRolloutCheck = z.infer<typeof parametrizabilityRolloutCheckSchema>

export const parametrizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ParametrizabilityRolloutStatus = z.infer<typeof parametrizabilityRolloutStatusSchema>

export const parametrizabilityCapabilitiesResponseSchema = z.object({
  supportsParametrizabilityRollout: z.literal(true),
  supportsParametrizabilityAdminTools: z.literal(true),
  supportsWorkspaceLimitParametrizabilitySignals: z.literal(true),
  supportsUsageEventParametrizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ParametrizabilityCapabilitiesResponse = z.infer<
  typeof parametrizabilityCapabilitiesResponseSchema
>

export const parametrizabilityRolloutResponseSchema = z.object({
  status: parametrizabilityRolloutStatusSchema,
  checks: z.array(parametrizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ParametrizabilityRolloutResponse = z.infer<
  typeof parametrizabilityRolloutResponseSchema
>

export function getParametrizabilityRolloutGuidance() {
  return 'Production parametrizability rollout validates workspace limit parametrizability, usage event parametrizability signals, billing record coverage, and parametrization readiness before production parametrizability tooling.'
}
