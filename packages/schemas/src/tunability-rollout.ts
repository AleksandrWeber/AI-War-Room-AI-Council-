import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const tunabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type TunabilityRolloutCheckStatus = z.infer<
  typeof tunabilityRolloutCheckStatusSchema
>

export const tunabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: tunabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type TunabilityRolloutCheck = z.infer<typeof tunabilityRolloutCheckSchema>

export const tunabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type TunabilityRolloutStatus = z.infer<typeof tunabilityRolloutStatusSchema>

export const tunabilityCapabilitiesResponseSchema = z.object({
  supportsTunabilityRollout: z.literal(true),
  supportsTunabilityAdminTools: z.literal(true),
  supportsUsageEventTunabilitySignals: z.literal(true),
  supportsWorkspaceLimitTunabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type TunabilityCapabilitiesResponse = z.infer<
  typeof tunabilityCapabilitiesResponseSchema
>

export const tunabilityRolloutResponseSchema = z.object({
  status: tunabilityRolloutStatusSchema,
  checks: z.array(tunabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type TunabilityRolloutResponse = z.infer<
  typeof tunabilityRolloutResponseSchema
>

export function getTunabilityRolloutGuidance() {
  return 'Production tunability rollout validates usage event tunability, workspace limit tunability signals, idempotency coverage, and tuning readiness before production tunability tooling.'
}
