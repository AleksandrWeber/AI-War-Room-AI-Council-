import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const keymanagementizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type KeymanagementizabilityRolloutCheckStatus = z.infer<
  typeof keymanagementizabilityRolloutCheckStatusSchema
>

export const keymanagementizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: keymanagementizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type KeymanagementizabilityRolloutCheck = z.infer<typeof keymanagementizabilityRolloutCheckSchema>

export const keymanagementizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type KeymanagementizabilityRolloutStatus = z.infer<typeof keymanagementizabilityRolloutStatusSchema>

export const keymanagementizabilityCapabilitiesResponseSchema = z.object({
  supportsKeymanagementizabilityRollout: z.literal(true),
  supportsKeymanagementizabilityAdminTools: z.literal(true),
  supportsMembershipKeymanagementizabilitySignals: z.literal(true),
  supportsUsageEventKeymanagementizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type KeymanagementizabilityCapabilitiesResponse = z.infer<
  typeof keymanagementizabilityCapabilitiesResponseSchema
>

export const keymanagementizabilityRolloutResponseSchema = z.object({
  status: keymanagementizabilityRolloutStatusSchema,
  checks: z.array(keymanagementizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type KeymanagementizabilityRolloutResponse = z.infer<
  typeof keymanagementizabilityRolloutResponseSchema
>

export function getKeymanagementizabilityRolloutGuidance() {
  return 'Production keymanagementizability rollout validates membership keymanagementizability, usage event keymanagementizability signals, billing notification coverage, and healingization readiness before production keymanagementizability tooling.'
}
