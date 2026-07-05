import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const encapsulizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type EncapsulizabilityRolloutCheckStatus = z.infer<
  typeof encapsulizabilityRolloutCheckStatusSchema
>

export const encapsulizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: encapsulizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type EncapsulizabilityRolloutCheck = z.infer<typeof encapsulizabilityRolloutCheckSchema>

export const encapsulizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type EncapsulizabilityRolloutStatus = z.infer<typeof encapsulizabilityRolloutStatusSchema>

export const encapsulizabilityCapabilitiesResponseSchema = z.object({
  supportsEncapsulizabilityRollout: z.literal(true),
  supportsEncapsulizabilityAdminTools: z.literal(true),
  supportsShieldScanEncapsulizabilitySignals: z.literal(true),
  supportsProviderCredentialEncapsulizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type EncapsulizabilityCapabilitiesResponse = z.infer<
  typeof encapsulizabilityCapabilitiesResponseSchema
>

export const encapsulizabilityRolloutResponseSchema = z.object({
  status: encapsulizabilityRolloutStatusSchema,
  checks: z.array(encapsulizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type EncapsulizabilityRolloutResponse = z.infer<
  typeof encapsulizabilityRolloutResponseSchema
>

export function getEncapsulizabilityRolloutGuidance() {
  return 'Production encapsulizability rollout validates shield scan encapsulizability, provider credential encapsulizability signals, billing webhook coverage, and encapsulization readiness before production encapsulizability tooling.'
}
