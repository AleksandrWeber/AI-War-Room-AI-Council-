import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const adaptizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type AdaptizabilityRolloutCheckStatus = z.infer<
  typeof adaptizabilityRolloutCheckStatusSchema
>

export const adaptizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: adaptizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type AdaptizabilityRolloutCheck = z.infer<typeof adaptizabilityRolloutCheckSchema>

export const adaptizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type AdaptizabilityRolloutStatus = z.infer<typeof adaptizabilityRolloutStatusSchema>

export const adaptizabilityCapabilitiesResponseSchema = z.object({
  supportsAdaptizabilityRollout: z.literal(true),
  supportsAdaptizabilityAdminTools: z.literal(true),
  supportsModelHealthAdaptizabilitySignals: z.literal(true),
  supportsModelRegistryAdaptizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type AdaptizabilityCapabilitiesResponse = z.infer<
  typeof adaptizabilityCapabilitiesResponseSchema
>

export const adaptizabilityRolloutResponseSchema = z.object({
  status: adaptizabilityRolloutStatusSchema,
  checks: z.array(adaptizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type AdaptizabilityRolloutResponse = z.infer<
  typeof adaptizabilityRolloutResponseSchema
>

export function getAdaptizabilityRolloutGuidance() {
  return 'Production adaptizability rollout validates model health adaptizability, model registry adaptizability signals, billing record coverage, and optimization readiness before production adaptizability tooling.'
}
