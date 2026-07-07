import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const notarjournalizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type NotarjournalizabilityRolloutCheckStatus = z.infer<
  typeof notarjournalizabilityRolloutCheckStatusSchema
>

export const notarjournalizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: notarjournalizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type NotarjournalizabilityRolloutCheck = z.infer<typeof notarjournalizabilityRolloutCheckSchema>

export const notarjournalizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type NotarjournalizabilityRolloutStatus = z.infer<typeof notarjournalizabilityRolloutStatusSchema>

export const notarjournalizabilityCapabilitiesResponseSchema = z.object({
  supportsNotarjournalizabilityRollout: z.literal(true),
  supportsNotarjournalizabilityAdminTools: z.literal(true),
  supportsMembershipNotarjournalizabilitySignals: z.literal(true),
  supportsUsageEventNotarjournalizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type NotarjournalizabilityCapabilitiesResponse = z.infer<
  typeof notarjournalizabilityCapabilitiesResponseSchema
>

export const notarjournalizabilityRolloutResponseSchema = z.object({
  status: notarjournalizabilityRolloutStatusSchema,
  checks: z.array(notarjournalizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type NotarjournalizabilityRolloutResponse = z.infer<
  typeof notarjournalizabilityRolloutResponseSchema
>

export function getNotarjournalizabilityRolloutGuidance() {
  return 'Production notarjournalizability rollout validates membership notarjournalizability, usage event notarjournalizability signals, billing notification coverage, and healingization readiness before production notarjournalizability tooling.'
}
