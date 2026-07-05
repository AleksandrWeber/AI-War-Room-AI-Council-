import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const stabilizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type StabilizabilityRolloutCheckStatus = z.infer<
  typeof stabilizabilityRolloutCheckStatusSchema
>

export const stabilizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: stabilizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type StabilizabilityRolloutCheck = z.infer<typeof stabilizabilityRolloutCheckSchema>

export const stabilizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type StabilizabilityRolloutStatus = z.infer<typeof stabilizabilityRolloutStatusSchema>

export const stabilizabilityCapabilitiesResponseSchema = z.object({
  supportsStabilizabilityRollout: z.literal(true),
  supportsStabilizabilityAdminTools: z.literal(true),
  supportsProviderCredentialStabilizabilitySignals: z.literal(true),
  supportsModelRegistryStabilizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type StabilizabilityCapabilitiesResponse = z.infer<
  typeof stabilizabilityCapabilitiesResponseSchema
>

export const stabilizabilityRolloutResponseSchema = z.object({
  status: stabilizabilityRolloutStatusSchema,
  checks: z.array(stabilizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type StabilizabilityRolloutResponse = z.infer<
  typeof stabilizabilityRolloutResponseSchema
>

export function getStabilizabilityRolloutGuidance() {
  return 'Production stabilizability rollout validates provider credential stabilizability, model registry stabilizability signals, billing webhook coverage, and stabilization readiness before production stabilizability tooling.'
}
