import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const progressiveizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ProgressiveizabilityRolloutCheckStatus = z.infer<
  typeof progressiveizabilityRolloutCheckStatusSchema
>

export const progressiveizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: progressiveizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ProgressiveizabilityRolloutCheck = z.infer<typeof progressiveizabilityRolloutCheckSchema>

export const progressiveizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ProgressiveizabilityRolloutStatus = z.infer<typeof progressiveizabilityRolloutStatusSchema>

export const progressiveizabilityCapabilitiesResponseSchema = z.object({
  supportsProgressiveizabilityRollout: z.literal(true),
  supportsProgressiveizabilityAdminTools: z.literal(true),
  supportsProviderCredentialProgressiveizabilitySignals: z.literal(true),
  supportsModelRegistryProgressiveizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ProgressiveizabilityCapabilitiesResponse = z.infer<
  typeof progressiveizabilityCapabilitiesResponseSchema
>

export const progressiveizabilityRolloutResponseSchema = z.object({
  status: progressiveizabilityRolloutStatusSchema,
  checks: z.array(progressiveizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ProgressiveizabilityRolloutResponse = z.infer<
  typeof progressiveizabilityRolloutResponseSchema
>

export function getProgressiveizabilityRolloutGuidance() {
  return 'Production progressiveizability rollout validates provider credential progressiveizability, model registry progressiveizability signals, billing webhook coverage, and progressiveization readiness before production progressiveizability tooling.'
}
