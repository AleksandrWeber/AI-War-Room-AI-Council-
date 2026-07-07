import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const accesscontrolizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type AccesscontrolizabilityRolloutCheckStatus = z.infer<
  typeof accesscontrolizabilityRolloutCheckStatusSchema
>

export const accesscontrolizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: accesscontrolizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type AccesscontrolizabilityRolloutCheck = z.infer<typeof accesscontrolizabilityRolloutCheckSchema>

export const accesscontrolizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type AccesscontrolizabilityRolloutStatus = z.infer<typeof accesscontrolizabilityRolloutStatusSchema>

export const accesscontrolizabilityCapabilitiesResponseSchema = z.object({
  supportsAccesscontrolizabilityRollout: z.literal(true),
  supportsAccesscontrolizabilityAdminTools: z.literal(true),
  supportsIdempotencyKeyAccesscontrolizabilitySignals: z.literal(true),
  supportsUsageEventAccesscontrolizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type AccesscontrolizabilityCapabilitiesResponse = z.infer<
  typeof accesscontrolizabilityCapabilitiesResponseSchema
>

export const accesscontrolizabilityRolloutResponseSchema = z.object({
  status: accesscontrolizabilityRolloutStatusSchema,
  checks: z.array(accesscontrolizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type AccesscontrolizabilityRolloutResponse = z.infer<
  typeof accesscontrolizabilityRolloutResponseSchema
>

export function getAccesscontrolizabilityRolloutGuidance() {
  return 'Production accesscontrolizability rollout validates idempotency key accesscontrolizability, usage event accesscontrolizability signals, billing webhook coverage, and remediationization readiness before production accesscontrolizability tooling.'
}
