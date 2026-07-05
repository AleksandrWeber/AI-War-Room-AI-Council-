import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const transparencyRolloutCheckStatusSchema = z.enum([
  'pass',
  'fail',
  'skip',
])
export type TransparencyRolloutCheckStatus = z.infer<
  typeof transparencyRolloutCheckStatusSchema
>

export const transparencyRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: transparencyRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type TransparencyRolloutCheck = z.infer<
  typeof transparencyRolloutCheckSchema
>

export const transparencyRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type TransparencyRolloutStatus = z.infer<
  typeof transparencyRolloutStatusSchema
>

export const transparencyCapabilitiesResponseSchema = z.object({
  supportsTransparencyRollout: z.literal(true),
  supportsTransparencyAdminTools: z.literal(true),
  supportsWorkflowTransparencySignals: z.literal(true),
  supportsBillingTransparencySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type TransparencyCapabilitiesResponse = z.infer<
  typeof transparencyCapabilitiesResponseSchema
>

export const transparencyRolloutResponseSchema = z.object({
  status: transparencyRolloutStatusSchema,
  checks: z.array(transparencyRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type TransparencyRolloutResponse = z.infer<
  typeof transparencyRolloutResponseSchema
>

export function getTransparencyRolloutGuidance() {
  return 'Production transparency rollout validates workflow transparency, billing notification visibility signals, meter usage reporting coverage, and disclosure readiness before production transparency tooling.'
}
