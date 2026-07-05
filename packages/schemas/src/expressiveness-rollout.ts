import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const expressivenessRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ExpressivenessRolloutCheckStatus = z.infer<
  typeof expressivenessRolloutCheckStatusSchema
>

export const expressivenessRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: expressivenessRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ExpressivenessRolloutCheck = z.infer<typeof expressivenessRolloutCheckSchema>

export const expressivenessRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ExpressivenessRolloutStatus = z.infer<typeof expressivenessRolloutStatusSchema>

export const expressivenessCapabilitiesResponseSchema = z.object({
  supportsExpressivenessRollout: z.literal(true),
  supportsExpressivenessAdminTools: z.literal(true),
  supportsAgentOutputExpressivenessSignals: z.literal(true),
  supportsSynthesisExpressivenessSignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ExpressivenessCapabilitiesResponse = z.infer<
  typeof expressivenessCapabilitiesResponseSchema
>

export const expressivenessRolloutResponseSchema = z.object({
  status: expressivenessRolloutStatusSchema,
  checks: z.array(expressivenessRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ExpressivenessRolloutResponse = z.infer<
  typeof expressivenessRolloutResponseSchema
>

export function getExpressivenessRolloutGuidance() {
  return 'Production expressiveness rollout validates agent output expressiveness, synthesis expressiveness signals, artifact coverage, and expression readiness before production expressiveness tooling.'
}
