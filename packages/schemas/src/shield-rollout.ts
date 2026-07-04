import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const shieldRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ShieldRolloutCheckStatus = z.infer<
  typeof shieldRolloutCheckStatusSchema
>

export const shieldRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: shieldRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ShieldRolloutCheck = z.infer<typeof shieldRolloutCheckSchema>

export const shieldRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ShieldRolloutStatus = z.infer<typeof shieldRolloutStatusSchema>

export const shieldCapabilitiesResponseSchema = z.object({
  classifierId: nonEmptyStringSchema,
  supportsShieldRollout: z.literal(true),
  supportsShieldReviewAdminTools: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ShieldCapabilitiesResponse = z.infer<
  typeof shieldCapabilitiesResponseSchema
>

export const shieldRolloutResponseSchema = z.object({
  status: shieldRolloutStatusSchema,
  classifierId: nonEmptyStringSchema,
  checks: z.array(shieldRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ShieldRolloutResponse = z.infer<typeof shieldRolloutResponseSchema>

export function getShieldRolloutGuidance(input: { classifierId: string }) {
  return `Shield rollout uses ${input.classifierId}. Verify review regression and adversarial coverage before production.`
}
