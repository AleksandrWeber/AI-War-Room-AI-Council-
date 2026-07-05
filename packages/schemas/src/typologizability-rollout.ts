import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const typologizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type TypologizabilityRolloutCheckStatus = z.infer<
  typeof typologizabilityRolloutCheckStatusSchema
>

export const typologizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: typologizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type TypologizabilityRolloutCheck = z.infer<typeof typologizabilityRolloutCheckSchema>

export const typologizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type TypologizabilityRolloutStatus = z.infer<typeof typologizabilityRolloutStatusSchema>

export const typologizabilityCapabilitiesResponseSchema = z.object({
  supportsTypologizabilityRollout: z.literal(true),
  supportsTypologizabilityAdminTools: z.literal(true),
  supportsMembershipTypologizabilitySignals: z.literal(true),
  supportsUsageEventTypologizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type TypologizabilityCapabilitiesResponse = z.infer<
  typeof typologizabilityCapabilitiesResponseSchema
>

export const typologizabilityRolloutResponseSchema = z.object({
  status: typologizabilityRolloutStatusSchema,
  checks: z.array(typologizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type TypologizabilityRolloutResponse = z.infer<
  typeof typologizabilityRolloutResponseSchema
>

export function getTypologizabilityRolloutGuidance() {
  return 'Production typologizability rollout validates membership typologizability, usage event typologizability signals, billing notification coverage, and typologization readiness before production typologizability tooling.'
}
