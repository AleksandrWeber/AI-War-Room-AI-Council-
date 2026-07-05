import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const regressizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type RegressizabilityRolloutCheckStatus = z.infer<
  typeof regressizabilityRolloutCheckStatusSchema
>

export const regressizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: regressizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type RegressizabilityRolloutCheck = z.infer<typeof regressizabilityRolloutCheckSchema>

export const regressizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type RegressizabilityRolloutStatus = z.infer<typeof regressizabilityRolloutStatusSchema>

export const regressizabilityCapabilitiesResponseSchema = z.object({
  supportsRegressizabilityRollout: z.literal(true),
  supportsRegressizabilityAdminTools: z.literal(true),
  supportsMeterUsageRegressizabilitySignals: z.literal(true),
  supportsUsageEventRegressizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type RegressizabilityCapabilitiesResponse = z.infer<
  typeof regressizabilityCapabilitiesResponseSchema
>

export const regressizabilityRolloutResponseSchema = z.object({
  status: regressizabilityRolloutStatusSchema,
  checks: z.array(regressizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type RegressizabilityRolloutResponse = z.infer<
  typeof regressizabilityRolloutResponseSchema
>

export function getRegressizabilityRolloutGuidance() {
  return 'Production regressizability rollout validates meter usage regressizability, usage event regressizability signals, workspace limit coverage, and regressization readiness before production regressizability tooling.'
}
