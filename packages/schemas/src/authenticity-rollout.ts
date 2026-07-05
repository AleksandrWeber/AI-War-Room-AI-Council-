import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const authenticityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type AuthenticityRolloutCheckStatus = z.infer<
  typeof authenticityRolloutCheckStatusSchema
>

export const authenticityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: authenticityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type AuthenticityRolloutCheck = z.infer<typeof authenticityRolloutCheckSchema>

export const authenticityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type AuthenticityRolloutStatus = z.infer<typeof authenticityRolloutStatusSchema>

export const authenticityCapabilitiesResponseSchema = z.object({
  supportsAuthenticityRollout: z.literal(true),
  supportsAuthenticityAdminTools: z.literal(true),
  supportsSynthesisAuthenticitySignals: z.literal(true),
  supportsAgentOutputAuthenticitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type AuthenticityCapabilitiesResponse = z.infer<
  typeof authenticityCapabilitiesResponseSchema
>

export const authenticityRolloutResponseSchema = z.object({
  status: authenticityRolloutStatusSchema,
  checks: z.array(authenticityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type AuthenticityRolloutResponse = z.infer<
  typeof authenticityRolloutResponseSchema
>

export function getAuthenticityRolloutGuidance() {
  return 'Production authenticity rollout validates synthesis authenticity, agent output authenticity signals, artifact coverage, and origin readiness before production authenticity tooling.'
}
