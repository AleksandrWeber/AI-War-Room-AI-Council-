import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const healingizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type HealingizabilityRolloutCheckStatus = z.infer<
  typeof healingizabilityRolloutCheckStatusSchema
>

export const healingizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: healingizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type HealingizabilityRolloutCheck = z.infer<typeof healingizabilityRolloutCheckSchema>

export const healingizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type HealingizabilityRolloutStatus = z.infer<typeof healingizabilityRolloutStatusSchema>

export const healingizabilityCapabilitiesResponseSchema = z.object({
  supportsHealingizabilityRollout: z.literal(true),
  supportsHealingizabilityAdminTools: z.literal(true),
  supportsMembershipHealingizabilitySignals: z.literal(true),
  supportsUsageEventHealingizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type HealingizabilityCapabilitiesResponse = z.infer<
  typeof healingizabilityCapabilitiesResponseSchema
>

export const healingizabilityRolloutResponseSchema = z.object({
  status: healingizabilityRolloutStatusSchema,
  checks: z.array(healingizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type HealingizabilityRolloutResponse = z.infer<
  typeof healingizabilityRolloutResponseSchema
>

export function getHealingizabilityRolloutGuidance() {
  return 'Production healingizability rollout validates membership healingizability, usage event healingizability signals, billing notification coverage, and healingization readiness before production healingizability tooling.'
}
