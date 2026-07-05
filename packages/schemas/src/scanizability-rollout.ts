import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const scanizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ScanizabilityRolloutCheckStatus = z.infer<
  typeof scanizabilityRolloutCheckStatusSchema
>

export const scanizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: scanizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ScanizabilityRolloutCheck = z.infer<typeof scanizabilityRolloutCheckSchema>

export const scanizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ScanizabilityRolloutStatus = z.infer<typeof scanizabilityRolloutStatusSchema>

export const scanizabilityCapabilitiesResponseSchema = z.object({
  supportsScanizabilityRollout: z.literal(true),
  supportsScanizabilityAdminTools: z.literal(true),
  supportsModelHealthScanizabilitySignals: z.literal(true),
  supportsModelRegistryScanizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ScanizabilityCapabilitiesResponse = z.infer<
  typeof scanizabilityCapabilitiesResponseSchema
>

export const scanizabilityRolloutResponseSchema = z.object({
  status: scanizabilityRolloutStatusSchema,
  checks: z.array(scanizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ScanizabilityRolloutResponse = z.infer<
  typeof scanizabilityRolloutResponseSchema
>

export function getScanizabilityRolloutGuidance() {
  return 'Production scanizability rollout validates model health scanizability, model registry scanizability signals, billing record coverage, and optimization readiness before production scanizability tooling.'
}
