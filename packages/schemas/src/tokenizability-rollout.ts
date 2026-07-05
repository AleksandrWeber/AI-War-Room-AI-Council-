import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const tokenizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type TokenizabilityRolloutCheckStatus = z.infer<
  typeof tokenizabilityRolloutCheckStatusSchema
>

export const tokenizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: tokenizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type TokenizabilityRolloutCheck = z.infer<typeof tokenizabilityRolloutCheckSchema>

export const tokenizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type TokenizabilityRolloutStatus = z.infer<typeof tokenizabilityRolloutStatusSchema>

export const tokenizabilityCapabilitiesResponseSchema = z.object({
  supportsTokenizabilityRollout: z.literal(true),
  supportsTokenizabilityAdminTools: z.literal(true),
  supportsMembershipTokenizabilitySignals: z.literal(true),
  supportsUsageEventTokenizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type TokenizabilityCapabilitiesResponse = z.infer<
  typeof tokenizabilityCapabilitiesResponseSchema
>

export const tokenizabilityRolloutResponseSchema = z.object({
  status: tokenizabilityRolloutStatusSchema,
  checks: z.array(tokenizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type TokenizabilityRolloutResponse = z.infer<
  typeof tokenizabilityRolloutResponseSchema
>

export function getTokenizabilityRolloutGuidance() {
  return 'Production tokenizability rollout validates membership tokenizability, usage event tokenizability signals, billing notification coverage, and tokenization readiness before production tokenizability tooling.'
}
