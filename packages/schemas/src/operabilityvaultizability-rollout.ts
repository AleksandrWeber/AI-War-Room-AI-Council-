import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const operabilityvaultizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type OperabilityvaultizabilityRolloutCheckStatus = z.infer<
  typeof operabilityvaultizabilityRolloutCheckStatusSchema
>

export const operabilityvaultizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: operabilityvaultizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type OperabilityvaultizabilityRolloutCheck = z.infer<typeof operabilityvaultizabilityRolloutCheckSchema>

export const operabilityvaultizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type OperabilityvaultizabilityRolloutStatus = z.infer<typeof operabilityvaultizabilityRolloutStatusSchema>

export const operabilityvaultizabilityCapabilitiesResponseSchema = z.object({
  supportsOperabilityvaultizabilityRollout: z.literal(true),
  supportsOperabilityvaultizabilityAdminTools: z.literal(true),
  supportsIdempotencyKeyOperabilityvaultizabilitySignals: z.literal(true),
  supportsUsageEventOperabilityvaultizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type OperabilityvaultizabilityCapabilitiesResponse = z.infer<
  typeof operabilityvaultizabilityCapabilitiesResponseSchema
>

export const operabilityvaultizabilityRolloutResponseSchema = z.object({
  status: operabilityvaultizabilityRolloutStatusSchema,
  checks: z.array(operabilityvaultizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type OperabilityvaultizabilityRolloutResponse = z.infer<
  typeof operabilityvaultizabilityRolloutResponseSchema
>

export function getOperabilityvaultizabilityRolloutGuidance() {
  return 'Production operabilityvaultizability rollout validates idempotency key operabilityvaultizability, usage event operabilityvaultizability signals, billing webhook coverage, and remediationization readiness before production operabilityvaultizability tooling.'
}
