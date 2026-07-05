import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const sustainizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type SustainizabilityRolloutCheckStatus = z.infer<
  typeof sustainizabilityRolloutCheckStatusSchema
>

export const sustainizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: sustainizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type SustainizabilityRolloutCheck = z.infer<typeof sustainizabilityRolloutCheckSchema>

export const sustainizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type SustainizabilityRolloutStatus = z.infer<typeof sustainizabilityRolloutStatusSchema>

export const sustainizabilityCapabilitiesResponseSchema = z.object({
  supportsSustainizabilityRollout: z.literal(true),
  supportsSustainizabilityAdminTools: z.literal(true),
  supportsModelHealthSustainizabilitySignals: z.literal(true),
  supportsModelRegistrySustainizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type SustainizabilityCapabilitiesResponse = z.infer<
  typeof sustainizabilityCapabilitiesResponseSchema
>

export const sustainizabilityRolloutResponseSchema = z.object({
  status: sustainizabilityRolloutStatusSchema,
  checks: z.array(sustainizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type SustainizabilityRolloutResponse = z.infer<
  typeof sustainizabilityRolloutResponseSchema
>

export function getSustainizabilityRolloutGuidance() {
  return 'Production sustainizability rollout validates model health sustainizability, model registry sustainizability signals, billing record coverage, and optimization readiness before production sustainizability tooling.'
}
