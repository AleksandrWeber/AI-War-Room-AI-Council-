import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const federatizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type FederatizabilityRolloutCheckStatus = z.infer<
  typeof federatizabilityRolloutCheckStatusSchema
>

export const federatizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: federatizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type FederatizabilityRolloutCheck = z.infer<typeof federatizabilityRolloutCheckSchema>

export const federatizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type FederatizabilityRolloutStatus = z.infer<typeof federatizabilityRolloutStatusSchema>

export const federatizabilityCapabilitiesResponseSchema = z.object({
  supportsFederatizabilityRollout: z.literal(true),
  supportsFederatizabilityAdminTools: z.literal(true),
  supportsWorkspaceLimitFederatizabilitySignals: z.literal(true),
  supportsUsageEventFederatizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type FederatizabilityCapabilitiesResponse = z.infer<
  typeof federatizabilityCapabilitiesResponseSchema
>

export const federatizabilityRolloutResponseSchema = z.object({
  status: federatizabilityRolloutStatusSchema,
  checks: z.array(federatizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type FederatizabilityRolloutResponse = z.infer<
  typeof federatizabilityRolloutResponseSchema
>

export function getFederatizabilityRolloutGuidance() {
  return 'Production federatizability rollout validates workspace limit federatizability, usage event federatizability signals, billing record coverage, and federatization readiness before production federatizability tooling.'
}
