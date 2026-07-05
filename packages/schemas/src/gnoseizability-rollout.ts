import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const gnoseizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type GnoseizabilityRolloutCheckStatus = z.infer<
  typeof gnoseizabilityRolloutCheckStatusSchema
>

export const gnoseizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: gnoseizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type GnoseizabilityRolloutCheck = z.infer<typeof gnoseizabilityRolloutCheckSchema>

export const gnoseizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type GnoseizabilityRolloutStatus = z.infer<typeof gnoseizabilityRolloutStatusSchema>

export const gnoseizabilityCapabilitiesResponseSchema = z.object({
  supportsGnoseizabilityRollout: z.literal(true),
  supportsGnoseizabilityAdminTools: z.literal(true),
  supportsMeterUsageGnoseizabilitySignals: z.literal(true),
  supportsUsageEventGnoseizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type GnoseizabilityCapabilitiesResponse = z.infer<
  typeof gnoseizabilityCapabilitiesResponseSchema
>

export const gnoseizabilityRolloutResponseSchema = z.object({
  status: gnoseizabilityRolloutStatusSchema,
  checks: z.array(gnoseizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type GnoseizabilityRolloutResponse = z.infer<
  typeof gnoseizabilityRolloutResponseSchema
>

export function getGnoseizabilityRolloutGuidance() {
  return 'Production gnoseizability rollout validates meter usage gnoseizability, usage event gnoseizability signals, workspace limit coverage, and gnoseization readiness before production gnoseizability tooling.'
}
