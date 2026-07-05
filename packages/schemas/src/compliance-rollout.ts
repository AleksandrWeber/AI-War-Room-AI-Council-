import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const complianceRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ComplianceRolloutCheckStatus = z.infer<
  typeof complianceRolloutCheckStatusSchema
>

export const complianceRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: complianceRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ComplianceRolloutCheck = z.infer<
  typeof complianceRolloutCheckSchema
>

export const complianceRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ComplianceRolloutStatus = z.infer<
  typeof complianceRolloutStatusSchema
>

export const complianceCapabilitiesResponseSchema = z.object({
  supportsComplianceRollout: z.literal(true),
  supportsComplianceAdminTools: z.literal(true),
  supportsPolicyTableCoverage: z.literal(true),
  supportsEncryptionAttestation: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ComplianceCapabilitiesResponse = z.infer<
  typeof complianceCapabilitiesResponseSchema
>

export const complianceRolloutResponseSchema = z.object({
  status: complianceRolloutStatusSchema,
  checks: z.array(complianceRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ComplianceRolloutResponse = z.infer<
  typeof complianceRolloutResponseSchema
>

export function getComplianceRolloutGuidance() {
  return 'Production compliance rollout validates policy table coverage, encryption key readiness, and workspace role governance before attestation-ready operations.'
}
