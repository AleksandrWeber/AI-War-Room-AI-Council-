import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const debouncizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type DebouncizabilityRolloutCheckStatus = z.infer<
  typeof debouncizabilityRolloutCheckStatusSchema
>

export const debouncizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: debouncizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type DebouncizabilityRolloutCheck = z.infer<typeof debouncizabilityRolloutCheckSchema>

export const debouncizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type DebouncizabilityRolloutStatus = z.infer<typeof debouncizabilityRolloutStatusSchema>

export const debouncizabilityCapabilitiesResponseSchema = z.object({
  supportsDebouncizabilityRollout: z.literal(true),
  supportsDebouncizabilityAdminTools: z.literal(true),
  supportsModelHealthDebouncizabilitySignals: z.literal(true),
  supportsModelRegistryDebouncizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type DebouncizabilityCapabilitiesResponse = z.infer<
  typeof debouncizabilityCapabilitiesResponseSchema
>

export const debouncizabilityRolloutResponseSchema = z.object({
  status: debouncizabilityRolloutStatusSchema,
  checks: z.array(debouncizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type DebouncizabilityRolloutResponse = z.infer<
  typeof debouncizabilityRolloutResponseSchema
>

export function getDebouncizabilityRolloutGuidance() {
  return 'Production debouncizability rollout validates model health debouncizability, model registry debouncizability signals, billing record coverage, and optimization readiness before production debouncizability tooling.'
}
