import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const definizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type DefinizabilityRolloutCheckStatus = z.infer<
  typeof definizabilityRolloutCheckStatusSchema
>

export const definizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: definizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type DefinizabilityRolloutCheck = z.infer<typeof definizabilityRolloutCheckSchema>

export const definizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type DefinizabilityRolloutStatus = z.infer<typeof definizabilityRolloutStatusSchema>

export const definizabilityCapabilitiesResponseSchema = z.object({
  supportsDefinizabilityRollout: z.literal(true),
  supportsDefinizabilityAdminTools: z.literal(true),
  supportsMembershipDefinizabilitySignals: z.literal(true),
  supportsUsageEventDefinizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type DefinizabilityCapabilitiesResponse = z.infer<
  typeof definizabilityCapabilitiesResponseSchema
>

export const definizabilityRolloutResponseSchema = z.object({
  status: definizabilityRolloutStatusSchema,
  checks: z.array(definizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type DefinizabilityRolloutResponse = z.infer<
  typeof definizabilityRolloutResponseSchema
>

export function getDefinizabilityRolloutGuidance() {
  return 'Production definizability rollout validates membership definizability, usage event definizability signals, billing notification coverage, and definization readiness before production definizability tooling.'
}
