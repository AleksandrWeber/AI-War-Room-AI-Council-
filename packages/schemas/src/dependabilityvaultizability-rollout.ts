import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const dependabilityvaultizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type DependabilityvaultizabilityRolloutCheckStatus = z.infer<
  typeof dependabilityvaultizabilityRolloutCheckStatusSchema
>

export const dependabilityvaultizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: dependabilityvaultizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type DependabilityvaultizabilityRolloutCheck = z.infer<typeof dependabilityvaultizabilityRolloutCheckSchema>

export const dependabilityvaultizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type DependabilityvaultizabilityRolloutStatus = z.infer<typeof dependabilityvaultizabilityRolloutStatusSchema>

export const dependabilityvaultizabilityCapabilitiesResponseSchema = z.object({
  supportsDependabilityvaultizabilityRollout: z.literal(true),
  supportsDependabilityvaultizabilityAdminTools: z.literal(true),
  supportsIdempotencyKeyDependabilityvaultizabilitySignals: z.literal(true),
  supportsUsageEventDependabilityvaultizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type DependabilityvaultizabilityCapabilitiesResponse = z.infer<
  typeof dependabilityvaultizabilityCapabilitiesResponseSchema
>

export const dependabilityvaultizabilityRolloutResponseSchema = z.object({
  status: dependabilityvaultizabilityRolloutStatusSchema,
  checks: z.array(dependabilityvaultizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type DependabilityvaultizabilityRolloutResponse = z.infer<
  typeof dependabilityvaultizabilityRolloutResponseSchema
>

export function getDependabilityvaultizabilityRolloutGuidance() {
  return 'Production dependabilityvaultizability rollout validates idempotency key dependabilityvaultizability, usage event dependabilityvaultizability signals, billing webhook coverage, and remediationization readiness before production dependabilityvaultizability tooling.'
}
