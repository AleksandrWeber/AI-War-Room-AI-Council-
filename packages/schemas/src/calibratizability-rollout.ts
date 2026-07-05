import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const calibratizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type CalibratizabilityRolloutCheckStatus = z.infer<
  typeof calibratizabilityRolloutCheckStatusSchema
>

export const calibratizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: calibratizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type CalibratizabilityRolloutCheck = z.infer<typeof calibratizabilityRolloutCheckSchema>

export const calibratizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type CalibratizabilityRolloutStatus = z.infer<typeof calibratizabilityRolloutStatusSchema>

export const calibratizabilityCapabilitiesResponseSchema = z.object({
  supportsCalibratizabilityRollout: z.literal(true),
  supportsCalibratizabilityAdminTools: z.literal(true),
  supportsShieldScanCalibratizabilitySignals: z.literal(true),
  supportsProviderCredentialCalibratizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type CalibratizabilityCapabilitiesResponse = z.infer<
  typeof calibratizabilityCapabilitiesResponseSchema
>

export const calibratizabilityRolloutResponseSchema = z.object({
  status: calibratizabilityRolloutStatusSchema,
  checks: z.array(calibratizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type CalibratizabilityRolloutResponse = z.infer<
  typeof calibratizabilityRolloutResponseSchema
>

export function getCalibratizabilityRolloutGuidance() {
  return 'Production calibratizability rollout validates shield scan calibratizability, provider credential calibratizability signals, billing webhook coverage, and calibratization readiness before production calibratizability tooling.'
}
