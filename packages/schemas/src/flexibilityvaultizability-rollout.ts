import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const flexibilityvaultizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type FlexibilityvaultizabilityRolloutCheckStatus = z.infer<
  typeof flexibilityvaultizabilityRolloutCheckStatusSchema
>

export const flexibilityvaultizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: flexibilityvaultizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type FlexibilityvaultizabilityRolloutCheck = z.infer<typeof flexibilityvaultizabilityRolloutCheckSchema>

export const flexibilityvaultizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type FlexibilityvaultizabilityRolloutStatus = z.infer<typeof flexibilityvaultizabilityRolloutStatusSchema>

export const flexibilityvaultizabilityCapabilitiesResponseSchema = z.object({
  supportsFlexibilityvaultizabilityRollout: z.literal(true),
  supportsFlexibilityvaultizabilityAdminTools: z.literal(true),
  supportsIdempotencyKeyFlexibilityvaultizabilitySignals: z.literal(true),
  supportsUsageEventFlexibilityvaultizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type FlexibilityvaultizabilityCapabilitiesResponse = z.infer<
  typeof flexibilityvaultizabilityCapabilitiesResponseSchema
>

export const flexibilityvaultizabilityRolloutResponseSchema = z.object({
  status: flexibilityvaultizabilityRolloutStatusSchema,
  checks: z.array(flexibilityvaultizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type FlexibilityvaultizabilityRolloutResponse = z.infer<
  typeof flexibilityvaultizabilityRolloutResponseSchema
>

export function getFlexibilityvaultizabilityRolloutGuidance() {
  return 'Production flexibilityvaultizability rollout validates idempotency key flexibilityvaultizability, usage event flexibilityvaultizability signals, billing webhook coverage, and remediationization readiness before production flexibilityvaultizability tooling.'
}
