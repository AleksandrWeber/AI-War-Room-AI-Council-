import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const repeatabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type RepeatabilityRolloutCheckStatus = z.infer<
  typeof repeatabilityRolloutCheckStatusSchema
>

export const repeatabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: repeatabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type RepeatabilityRolloutCheck = z.infer<typeof repeatabilityRolloutCheckSchema>

export const repeatabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type RepeatabilityRolloutStatus = z.infer<typeof repeatabilityRolloutStatusSchema>

export const repeatabilityCapabilitiesResponseSchema = z.object({
  supportsRepeatabilityRollout: z.literal(true),
  supportsRepeatabilityAdminTools: z.literal(true),
  supportsArtifactRepeatabilitySignals: z.literal(true),
  supportsWorkflowRepeatabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type RepeatabilityCapabilitiesResponse = z.infer<
  typeof repeatabilityCapabilitiesResponseSchema
>

export const repeatabilityRolloutResponseSchema = z.object({
  status: repeatabilityRolloutStatusSchema,
  checks: z.array(repeatabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type RepeatabilityRolloutResponse = z.infer<
  typeof repeatabilityRolloutResponseSchema
>

export function getRepeatabilityRolloutGuidance() {
  return 'Production repeatability rollout validates artifact repeatability, workflow repeatability signals, billing notification coverage, and repetition readiness before production repeatability tooling.'
}
