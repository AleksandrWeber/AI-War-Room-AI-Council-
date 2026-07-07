import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const authenticityvaultizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type AuthenticityvaultizabilityRolloutCheckStatus = z.infer<
  typeof authenticityvaultizabilityRolloutCheckStatusSchema
>

export const authenticityvaultizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: authenticityvaultizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type AuthenticityvaultizabilityRolloutCheck = z.infer<typeof authenticityvaultizabilityRolloutCheckSchema>

export const authenticityvaultizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type AuthenticityvaultizabilityRolloutStatus = z.infer<typeof authenticityvaultizabilityRolloutStatusSchema>

export const authenticityvaultizabilityCapabilitiesResponseSchema = z.object({
  supportsAuthenticityvaultizabilityRollout: z.literal(true),
  supportsAuthenticityvaultizabilityAdminTools: z.literal(true),
  supportsMembershipAuthenticityvaultizabilitySignals: z.literal(true),
  supportsUsageEventAuthenticityvaultizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type AuthenticityvaultizabilityCapabilitiesResponse = z.infer<
  typeof authenticityvaultizabilityCapabilitiesResponseSchema
>

export const authenticityvaultizabilityRolloutResponseSchema = z.object({
  status: authenticityvaultizabilityRolloutStatusSchema,
  checks: z.array(authenticityvaultizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type AuthenticityvaultizabilityRolloutResponse = z.infer<
  typeof authenticityvaultizabilityRolloutResponseSchema
>

export function getAuthenticityvaultizabilityRolloutGuidance() {
  return 'Production authenticityvaultizability rollout validates membership authenticityvaultizability, usage event authenticityvaultizability signals, billing notification coverage, and healingization readiness before production authenticityvaultizability tooling.'
}
