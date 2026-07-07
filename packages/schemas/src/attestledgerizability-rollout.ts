import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const attestledgerizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type AttestledgerizabilityRolloutCheckStatus = z.infer<
  typeof attestledgerizabilityRolloutCheckStatusSchema
>

export const attestledgerizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: attestledgerizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type AttestledgerizabilityRolloutCheck = z.infer<typeof attestledgerizabilityRolloutCheckSchema>

export const attestledgerizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type AttestledgerizabilityRolloutStatus = z.infer<typeof attestledgerizabilityRolloutStatusSchema>

export const attestledgerizabilityCapabilitiesResponseSchema = z.object({
  supportsAttestledgerizabilityRollout: z.literal(true),
  supportsAttestledgerizabilityAdminTools: z.literal(true),
  supportsMembershipAttestledgerizabilitySignals: z.literal(true),
  supportsUsageEventAttestledgerizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type AttestledgerizabilityCapabilitiesResponse = z.infer<
  typeof attestledgerizabilityCapabilitiesResponseSchema
>

export const attestledgerizabilityRolloutResponseSchema = z.object({
  status: attestledgerizabilityRolloutStatusSchema,
  checks: z.array(attestledgerizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type AttestledgerizabilityRolloutResponse = z.infer<
  typeof attestledgerizabilityRolloutResponseSchema
>

export function getAttestledgerizabilityRolloutGuidance() {
  return 'Production attestledgerizability rollout validates membership attestledgerizability, usage event attestledgerizability signals, billing notification coverage, and healingization readiness before production attestledgerizability tooling.'
}
