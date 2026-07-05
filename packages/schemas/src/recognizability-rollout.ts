import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const recognizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type RecognizabilityRolloutCheckStatus = z.infer<
  typeof recognizabilityRolloutCheckStatusSchema
>

export const recognizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: recognizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type RecognizabilityRolloutCheck = z.infer<typeof recognizabilityRolloutCheckSchema>

export const recognizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type RecognizabilityRolloutStatus = z.infer<typeof recognizabilityRolloutStatusSchema>

export const recognizabilityCapabilitiesResponseSchema = z.object({
  supportsRecognizabilityRollout: z.literal(true),
  supportsRecognizabilityAdminTools: z.literal(true),
  supportsArtifactRecognizabilitySignals: z.literal(true),
  supportsWorkflowRecognizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type RecognizabilityCapabilitiesResponse = z.infer<
  typeof recognizabilityCapabilitiesResponseSchema
>

export const recognizabilityRolloutResponseSchema = z.object({
  status: recognizabilityRolloutStatusSchema,
  checks: z.array(recognizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type RecognizabilityRolloutResponse = z.infer<
  typeof recognizabilityRolloutResponseSchema
>

export function getRecognizabilityRolloutGuidance() {
  return 'Production recognizability rollout validates artifact recognizability, workflow recognizability signals, billing notification coverage, and recognition readiness before production recognizability tooling.'
}
