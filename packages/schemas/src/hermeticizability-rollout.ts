import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const hermeticizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type HermeticizabilityRolloutCheckStatus = z.infer<
  typeof hermeticizabilityRolloutCheckStatusSchema
>

export const hermeticizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: hermeticizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type HermeticizabilityRolloutCheck = z.infer<typeof hermeticizabilityRolloutCheckSchema>

export const hermeticizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type HermeticizabilityRolloutStatus = z.infer<typeof hermeticizabilityRolloutStatusSchema>

export const hermeticizabilityCapabilitiesResponseSchema = z.object({
  supportsHermeticizabilityRollout: z.literal(true),
  supportsHermeticizabilityAdminTools: z.literal(true),
  supportsModelHealthHermeticizabilitySignals: z.literal(true),
  supportsModelRegistryHermeticizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type HermeticizabilityCapabilitiesResponse = z.infer<
  typeof hermeticizabilityCapabilitiesResponseSchema
>

export const hermeticizabilityRolloutResponseSchema = z.object({
  status: hermeticizabilityRolloutStatusSchema,
  checks: z.array(hermeticizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type HermeticizabilityRolloutResponse = z.infer<
  typeof hermeticizabilityRolloutResponseSchema
>

export function getHermeticizabilityRolloutGuidance() {
  return 'Production hermeticizability rollout validates model health hermeticizability, model registry hermeticizability signals, billing record coverage, and hermeticization readiness before production hermeticizability tooling.'
}
