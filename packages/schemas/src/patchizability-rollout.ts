import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const patchizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type PatchizabilityRolloutCheckStatus = z.infer<
  typeof patchizabilityRolloutCheckStatusSchema
>

export const patchizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: patchizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type PatchizabilityRolloutCheck = z.infer<typeof patchizabilityRolloutCheckSchema>

export const patchizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type PatchizabilityRolloutStatus = z.infer<typeof patchizabilityRolloutStatusSchema>

export const patchizabilityCapabilitiesResponseSchema = z.object({
  supportsPatchizabilityRollout: z.literal(true),
  supportsPatchizabilityAdminTools: z.literal(true),
  supportsModelHealthPatchizabilitySignals: z.literal(true),
  supportsModelRegistryPatchizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type PatchizabilityCapabilitiesResponse = z.infer<
  typeof patchizabilityCapabilitiesResponseSchema
>

export const patchizabilityRolloutResponseSchema = z.object({
  status: patchizabilityRolloutStatusSchema,
  checks: z.array(patchizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type PatchizabilityRolloutResponse = z.infer<
  typeof patchizabilityRolloutResponseSchema
>

export function getPatchizabilityRolloutGuidance() {
  return 'Production patchizability rollout validates model health patchizability, model registry patchizability signals, billing record coverage, and optimization readiness before production patchizability tooling.'
}
