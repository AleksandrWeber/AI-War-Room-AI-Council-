import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const communicabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type CommunicabilityRolloutCheckStatus = z.infer<
  typeof communicabilityRolloutCheckStatusSchema
>

export const communicabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: communicabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type CommunicabilityRolloutCheck = z.infer<typeof communicabilityRolloutCheckSchema>

export const communicabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type CommunicabilityRolloutStatus = z.infer<typeof communicabilityRolloutStatusSchema>

export const communicabilityCapabilitiesResponseSchema = z.object({
  supportsCommunicabilityRollout: z.literal(true),
  supportsCommunicabilityAdminTools: z.literal(true),
  supportsSynthesisCommunicabilitySignals: z.literal(true),
  supportsAgentOutputCommunicabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type CommunicabilityCapabilitiesResponse = z.infer<
  typeof communicabilityCapabilitiesResponseSchema
>

export const communicabilityRolloutResponseSchema = z.object({
  status: communicabilityRolloutStatusSchema,
  checks: z.array(communicabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type CommunicabilityRolloutResponse = z.infer<
  typeof communicabilityRolloutResponseSchema
>

export function getCommunicabilityRolloutGuidance() {
  return 'Production communicability rollout validates synthesis communicability, agent output communicability signals, artifact coverage, and communication readiness before production communicability tooling.'
}
