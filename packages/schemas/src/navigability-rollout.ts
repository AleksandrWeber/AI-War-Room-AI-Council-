import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const navigabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type NavigabilityRolloutCheckStatus = z.infer<
  typeof navigabilityRolloutCheckStatusSchema
>

export const navigabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: navigabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type NavigabilityRolloutCheck = z.infer<typeof navigabilityRolloutCheckSchema>

export const navigabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type NavigabilityRolloutStatus = z.infer<typeof navigabilityRolloutStatusSchema>

export const navigabilityCapabilitiesResponseSchema = z.object({
  supportsNavigabilityRollout: z.literal(true),
  supportsNavigabilityAdminTools: z.literal(true),
  supportsWorkflowNavigabilitySignals: z.literal(true),
  supportsSynthesisNavigabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type NavigabilityCapabilitiesResponse = z.infer<
  typeof navigabilityCapabilitiesResponseSchema
>

export const navigabilityRolloutResponseSchema = z.object({
  status: navigabilityRolloutStatusSchema,
  checks: z.array(navigabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type NavigabilityRolloutResponse = z.infer<
  typeof navigabilityRolloutResponseSchema
>

export function getNavigabilityRolloutGuidance() {
  return 'Production navigability rollout validates workflow navigability, synthesis navigability signals, billing invoice coverage, and navigation readiness before production navigability tooling.'
}
