import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const warrantabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type WarrantabilityRolloutCheckStatus = z.infer<
  typeof warrantabilityRolloutCheckStatusSchema
>

export const warrantabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: warrantabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type WarrantabilityRolloutCheck = z.infer<typeof warrantabilityRolloutCheckSchema>

export const warrantabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type WarrantabilityRolloutStatus = z.infer<typeof warrantabilityRolloutStatusSchema>

export const warrantabilityCapabilitiesResponseSchema = z.object({
  supportsWarrantabilityRollout: z.literal(true),
  supportsWarrantabilityAdminTools: z.literal(true),
  supportsShieldScanWarrantabilitySignals: z.literal(true),
  supportsArtifactWarrantabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type WarrantabilityCapabilitiesResponse = z.infer<
  typeof warrantabilityCapabilitiesResponseSchema
>

export const warrantabilityRolloutResponseSchema = z.object({
  status: warrantabilityRolloutStatusSchema,
  checks: z.array(warrantabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type WarrantabilityRolloutResponse = z.infer<
  typeof warrantabilityRolloutResponseSchema
>

export function getWarrantabilityRolloutGuidance() {
  return 'Production warrantability rollout validates shield scan warrantability, artifact warrantability signals, run workflow coverage, and warrant readiness before production warrantability tooling.'
}
