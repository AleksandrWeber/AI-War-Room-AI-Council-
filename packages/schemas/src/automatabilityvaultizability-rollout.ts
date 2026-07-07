import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const automatabilityvaultizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type AutomatabilityvaultizabilityRolloutCheckStatus = z.infer<
  typeof automatabilityvaultizabilityRolloutCheckStatusSchema
>

export const automatabilityvaultizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: automatabilityvaultizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type AutomatabilityvaultizabilityRolloutCheck = z.infer<typeof automatabilityvaultizabilityRolloutCheckSchema>

export const automatabilityvaultizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type AutomatabilityvaultizabilityRolloutStatus = z.infer<typeof automatabilityvaultizabilityRolloutStatusSchema>

export const automatabilityvaultizabilityCapabilitiesResponseSchema = z.object({
  supportsAutomatabilityvaultizabilityRollout: z.literal(true),
  supportsAutomatabilityvaultizabilityAdminTools: z.literal(true),
  supportsIdempotencyKeyAutomatabilityvaultizabilitySignals: z.literal(true),
  supportsUsageEventAutomatabilityvaultizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type AutomatabilityvaultizabilityCapabilitiesResponse = z.infer<
  typeof automatabilityvaultizabilityCapabilitiesResponseSchema
>

export const automatabilityvaultizabilityRolloutResponseSchema = z.object({
  status: automatabilityvaultizabilityRolloutStatusSchema,
  checks: z.array(automatabilityvaultizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type AutomatabilityvaultizabilityRolloutResponse = z.infer<
  typeof automatabilityvaultizabilityRolloutResponseSchema
>

export function getAutomatabilityvaultizabilityRolloutGuidance() {
  return 'Production automatabilityvaultizability rollout validates idempotency key automatabilityvaultizability, usage event automatabilityvaultizability signals, billing webhook coverage, and remediationization readiness before production automatabilityvaultizability tooling.'
}
