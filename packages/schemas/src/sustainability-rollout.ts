import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const sustainabilityRolloutCheckStatusSchema = z.enum([
  'pass',
  'fail',
  'skip',
])
export type SustainabilityRolloutCheckStatus = z.infer<
  typeof sustainabilityRolloutCheckStatusSchema
>

export const sustainabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: sustainabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type SustainabilityRolloutCheck = z.infer<
  typeof sustainabilityRolloutCheckSchema
>

export const sustainabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type SustainabilityRolloutStatus = z.infer<
  typeof sustainabilityRolloutStatusSchema
>

export const sustainabilityCapabilitiesResponseSchema = z.object({
  supportsSustainabilityRollout: z.literal(true),
  supportsSustainabilityAdminTools: z.literal(true),
  supportsBillingSustainabilitySignals: z.literal(true),
  supportsUsageSustainabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type SustainabilityCapabilitiesResponse = z.infer<
  typeof sustainabilityCapabilitiesResponseSchema
>

export const sustainabilityRolloutResponseSchema = z.object({
  status: sustainabilityRolloutStatusSchema,
  checks: z.array(sustainabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type SustainabilityRolloutResponse = z.infer<
  typeof sustainabilityRolloutResponseSchema
>

export function getSustainabilityRolloutGuidance() {
  return 'Production sustainability rollout validates billing sustainability, usage sustainability signals, run outcome coverage, and operational readiness before production sustainability tooling.'
}
