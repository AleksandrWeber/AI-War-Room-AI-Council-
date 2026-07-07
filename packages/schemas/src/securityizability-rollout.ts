import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const securityizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type SecurityizabilityRolloutCheckStatus = z.infer<
  typeof securityizabilityRolloutCheckStatusSchema
>

export const securityizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: securityizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type SecurityizabilityRolloutCheck = z.infer<typeof securityizabilityRolloutCheckSchema>

export const securityizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type SecurityizabilityRolloutStatus = z.infer<typeof securityizabilityRolloutStatusSchema>

export const securityizabilityCapabilitiesResponseSchema = z.object({
  supportsSecurityizabilityRollout: z.literal(true),
  supportsSecurityizabilityAdminTools: z.literal(true),
  supportsMembershipSecurityizabilitySignals: z.literal(true),
  supportsUsageEventSecurityizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type SecurityizabilityCapabilitiesResponse = z.infer<
  typeof securityizabilityCapabilitiesResponseSchema
>

export const securityizabilityRolloutResponseSchema = z.object({
  status: securityizabilityRolloutStatusSchema,
  checks: z.array(securityizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type SecurityizabilityRolloutResponse = z.infer<
  typeof securityizabilityRolloutResponseSchema
>

export function getSecurityizabilityRolloutGuidance() {
  return 'Production securityizability rollout validates membership securityizability, usage event securityizability signals, billing notification coverage, and healingization readiness before production securityizability tooling.'
}
