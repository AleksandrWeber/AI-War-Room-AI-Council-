import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const determinizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type DeterminizabilityRolloutCheckStatus = z.infer<
  typeof determinizabilityRolloutCheckStatusSchema
>

export const determinizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: determinizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type DeterminizabilityRolloutCheck = z.infer<typeof determinizabilityRolloutCheckSchema>

export const determinizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type DeterminizabilityRolloutStatus = z.infer<typeof determinizabilityRolloutStatusSchema>

export const determinizabilityCapabilitiesResponseSchema = z.object({
  supportsDeterminizabilityRollout: z.literal(true),
  supportsDeterminizabilityAdminTools: z.literal(true),
  supportsWorkspaceLimitDeterminizabilitySignals: z.literal(true),
  supportsUsageEventDeterminizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type DeterminizabilityCapabilitiesResponse = z.infer<
  typeof determinizabilityCapabilitiesResponseSchema
>

export const determinizabilityRolloutResponseSchema = z.object({
  status: determinizabilityRolloutStatusSchema,
  checks: z.array(determinizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type DeterminizabilityRolloutResponse = z.infer<
  typeof determinizabilityRolloutResponseSchema
>

export function getDeterminizabilityRolloutGuidance() {
  return 'Production determinizability rollout validates workspace limit determinizability, usage event determinizability signals, billing record coverage, and determinization readiness before production determinizability tooling.'
}
