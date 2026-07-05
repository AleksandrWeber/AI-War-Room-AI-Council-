import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const maintainabilityRolloutCheckStatusSchema = z.enum([
  'pass',
  'fail',
  'skip',
])
export type MaintainabilityRolloutCheckStatus = z.infer<
  typeof maintainabilityRolloutCheckStatusSchema
>

export const maintainabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: maintainabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type MaintainabilityRolloutCheck = z.infer<
  typeof maintainabilityRolloutCheckSchema
>

export const maintainabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type MaintainabilityRolloutStatus = z.infer<
  typeof maintainabilityRolloutStatusSchema
>

export const maintainabilityCapabilitiesResponseSchema = z.object({
  supportsMaintainabilityRollout: z.literal(true),
  supportsMaintainabilityAdminTools: z.literal(true),
  supportsMigrationOperabilitySignals: z.literal(true),
  supportsModelHealthMaintainabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type MaintainabilityCapabilitiesResponse = z.infer<
  typeof maintainabilityCapabilitiesResponseSchema
>

export const maintainabilityRolloutResponseSchema = z.object({
  status: maintainabilityRolloutStatusSchema,
  checks: z.array(maintainabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type MaintainabilityRolloutResponse = z.infer<
  typeof maintainabilityRolloutResponseSchema
>

export function getMaintainabilityRolloutGuidance() {
  return 'Production maintainability rollout validates migration operability, model health maintainability, usage event coverage, and operability readiness before production maintainability tooling.'
}
