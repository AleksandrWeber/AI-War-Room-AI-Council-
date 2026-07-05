import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const parabolizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ParabolizabilityRolloutCheckStatus = z.infer<
  typeof parabolizabilityRolloutCheckStatusSchema
>

export const parabolizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: parabolizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ParabolizabilityRolloutCheck = z.infer<typeof parabolizabilityRolloutCheckSchema>

export const parabolizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ParabolizabilityRolloutStatus = z.infer<typeof parabolizabilityRolloutStatusSchema>

export const parabolizabilityCapabilitiesResponseSchema = z.object({
  supportsParabolizabilityRollout: z.literal(true),
  supportsParabolizabilityAdminTools: z.literal(true),
  supportsSynthesisParabolizabilitySignals: z.literal(true),
  supportsAgentOutputParabolizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ParabolizabilityCapabilitiesResponse = z.infer<
  typeof parabolizabilityCapabilitiesResponseSchema
>

export const parabolizabilityRolloutResponseSchema = z.object({
  status: parabolizabilityRolloutStatusSchema,
  checks: z.array(parabolizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ParabolizabilityRolloutResponse = z.infer<
  typeof parabolizabilityRolloutResponseSchema
>

export function getParabolizabilityRolloutGuidance() {
  return 'Production parabolizability rollout validates synthesis parabolizability, agent output parabolizability signals, artifact coverage, and parabolization readiness before production parabolizability tooling.'
}
