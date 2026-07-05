import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const adoptabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type AdoptabilityRolloutCheckStatus = z.infer<
  typeof adoptabilityRolloutCheckStatusSchema
>

export const adoptabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: adoptabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type AdoptabilityRolloutCheck = z.infer<typeof adoptabilityRolloutCheckSchema>

export const adoptabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type AdoptabilityRolloutStatus = z.infer<typeof adoptabilityRolloutStatusSchema>

export const adoptabilityCapabilitiesResponseSchema = z.object({
  supportsAdoptabilityRollout: z.literal(true),
  supportsAdoptabilityAdminTools: z.literal(true),
  supportsUsageEventAdoptabilitySignals: z.literal(true),
  supportsMembershipAdoptabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type AdoptabilityCapabilitiesResponse = z.infer<
  typeof adoptabilityCapabilitiesResponseSchema
>

export const adoptabilityRolloutResponseSchema = z.object({
  status: adoptabilityRolloutStatusSchema,
  checks: z.array(adoptabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type AdoptabilityRolloutResponse = z.infer<
  typeof adoptabilityRolloutResponseSchema
>

export function getAdoptabilityRolloutGuidance() {
  return 'Production adoptability rollout validates usage event adoptability, membership adoptability signals, billing notification coverage, and adoption readiness before production adoptability tooling.'
}
