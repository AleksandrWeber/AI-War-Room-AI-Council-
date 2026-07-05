import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const curatizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type CuratizabilityRolloutCheckStatus = z.infer<
  typeof curatizabilityRolloutCheckStatusSchema
>

export const curatizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: curatizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type CuratizabilityRolloutCheck = z.infer<typeof curatizabilityRolloutCheckSchema>

export const curatizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type CuratizabilityRolloutStatus = z.infer<typeof curatizabilityRolloutStatusSchema>

export const curatizabilityCapabilitiesResponseSchema = z.object({
  supportsCuratizabilityRollout: z.literal(true),
  supportsCuratizabilityAdminTools: z.literal(true),
  supportsMeterUsageCuratizabilitySignals: z.literal(true),
  supportsUsageEventCuratizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type CuratizabilityCapabilitiesResponse = z.infer<
  typeof curatizabilityCapabilitiesResponseSchema
>

export const curatizabilityRolloutResponseSchema = z.object({
  status: curatizabilityRolloutStatusSchema,
  checks: z.array(curatizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type CuratizabilityRolloutResponse = z.infer<
  typeof curatizabilityRolloutResponseSchema
>

export function getCuratizabilityRolloutGuidance() {
  return 'Production curatizability rollout validates meter usage curatizability, usage event curatizability signals, workspace limit coverage, and curatization readiness before production curatizability tooling.'
}
