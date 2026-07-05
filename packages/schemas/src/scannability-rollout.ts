import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const scannabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ScannabilityRolloutCheckStatus = z.infer<
  typeof scannabilityRolloutCheckStatusSchema
>

export const scannabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: scannabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ScannabilityRolloutCheck = z.infer<typeof scannabilityRolloutCheckSchema>

export const scannabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ScannabilityRolloutStatus = z.infer<typeof scannabilityRolloutStatusSchema>

export const scannabilityCapabilitiesResponseSchema = z.object({
  supportsScannabilityRollout: z.literal(true),
  supportsScannabilityAdminTools: z.literal(true),
  supportsShieldScanScannabilitySignals: z.literal(true),
  supportsProviderCredentialScannabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ScannabilityCapabilitiesResponse = z.infer<
  typeof scannabilityCapabilitiesResponseSchema
>

export const scannabilityRolloutResponseSchema = z.object({
  status: scannabilityRolloutStatusSchema,
  checks: z.array(scannabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ScannabilityRolloutResponse = z.infer<
  typeof scannabilityRolloutResponseSchema
>

export function getScannabilityRolloutGuidance() {
  return 'Production scannability rollout validates shield scan scannability, provider credential scannability signals, billing webhook coverage, and scanning readiness before production scannability tooling.'
}
