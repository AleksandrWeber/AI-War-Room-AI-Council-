import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const convergizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ConvergizabilityRolloutCheckStatus = z.infer<
  typeof convergizabilityRolloutCheckStatusSchema
>

export const convergizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: convergizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ConvergizabilityRolloutCheck = z.infer<typeof convergizabilityRolloutCheckSchema>

export const convergizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ConvergizabilityRolloutStatus = z.infer<typeof convergizabilityRolloutStatusSchema>

export const convergizabilityCapabilitiesResponseSchema = z.object({
  supportsConvergizabilityRollout: z.literal(true),
  supportsConvergizabilityAdminTools: z.literal(true),
  supportsWorkspaceLimitConvergizabilitySignals: z.literal(true),
  supportsUsageEventConvergizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ConvergizabilityCapabilitiesResponse = z.infer<
  typeof convergizabilityCapabilitiesResponseSchema
>

export const convergizabilityRolloutResponseSchema = z.object({
  status: convergizabilityRolloutStatusSchema,
  checks: z.array(convergizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ConvergizabilityRolloutResponse = z.infer<
  typeof convergizabilityRolloutResponseSchema
>

export function getConvergizabilityRolloutGuidance() {
  return 'Production convergizability rollout validates workspace limit convergizability, usage event convergizability signals, billing record coverage, and convergization readiness before production convergizability tooling.'
}
