import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const historizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type HistorizabilityRolloutCheckStatus = z.infer<
  typeof historizabilityRolloutCheckStatusSchema
>

export const historizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: historizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type HistorizabilityRolloutCheck = z.infer<typeof historizabilityRolloutCheckSchema>

export const historizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type HistorizabilityRolloutStatus = z.infer<typeof historizabilityRolloutStatusSchema>

export const historizabilityCapabilitiesResponseSchema = z.object({
  supportsHistorizabilityRollout: z.literal(true),
  supportsHistorizabilityAdminTools: z.literal(true),
  supportsProviderCredentialHistorizabilitySignals: z.literal(true),
  supportsModelRegistryHistorizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type HistorizabilityCapabilitiesResponse = z.infer<
  typeof historizabilityCapabilitiesResponseSchema
>

export const historizabilityRolloutResponseSchema = z.object({
  status: historizabilityRolloutStatusSchema,
  checks: z.array(historizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type HistorizabilityRolloutResponse = z.infer<
  typeof historizabilityRolloutResponseSchema
>

export function getHistorizabilityRolloutGuidance() {
  return 'Production historizability rollout validates provider credential historizability, model registry historizability signals, billing webhook coverage, and historization readiness before production historizability tooling.'
}
