import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const maintainabilizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type MaintainabilizabilityRolloutCheckStatus = z.infer<
  typeof maintainabilizabilityRolloutCheckStatusSchema
>

export const maintainabilizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: maintainabilizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type MaintainabilizabilityRolloutCheck = z.infer<typeof maintainabilizabilityRolloutCheckSchema>

export const maintainabilizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type MaintainabilizabilityRolloutStatus = z.infer<typeof maintainabilizabilityRolloutStatusSchema>

export const maintainabilizabilityCapabilitiesResponseSchema = z.object({
  supportsMaintainabilizabilityRollout: z.literal(true),
  supportsMaintainabilizabilityAdminTools: z.literal(true),
  supportsMembershipMaintainabilizabilitySignals: z.literal(true),
  supportsUsageEventMaintainabilizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type MaintainabilizabilityCapabilitiesResponse = z.infer<
  typeof maintainabilizabilityCapabilitiesResponseSchema
>

export const maintainabilizabilityRolloutResponseSchema = z.object({
  status: maintainabilizabilityRolloutStatusSchema,
  checks: z.array(maintainabilizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type MaintainabilizabilityRolloutResponse = z.infer<
  typeof maintainabilizabilityRolloutResponseSchema
>

export function getMaintainabilizabilityRolloutGuidance() {
  return 'Production maintainabilizability rollout validates membership maintainabilizability, usage event maintainabilizability signals, billing notification coverage, and maintainabilization readiness before production maintainabilizability tooling.'
}
