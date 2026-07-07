import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const certificationizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type CertificationizabilityRolloutCheckStatus = z.infer<
  typeof certificationizabilityRolloutCheckStatusSchema
>

export const certificationizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: certificationizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type CertificationizabilityRolloutCheck = z.infer<typeof certificationizabilityRolloutCheckSchema>

export const certificationizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type CertificationizabilityRolloutStatus = z.infer<typeof certificationizabilityRolloutStatusSchema>

export const certificationizabilityCapabilitiesResponseSchema = z.object({
  supportsCertificationizabilityRollout: z.literal(true),
  supportsCertificationizabilityAdminTools: z.literal(true),
  supportsBillingInvoiceCertificationizabilitySignals: z.literal(true),
  supportsBillingRecordCertificationizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type CertificationizabilityCapabilitiesResponse = z.infer<
  typeof certificationizabilityCapabilitiesResponseSchema
>

export const certificationizabilityRolloutResponseSchema = z.object({
  status: certificationizabilityRolloutStatusSchema,
  checks: z.array(certificationizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type CertificationizabilityRolloutResponse = z.infer<
  typeof certificationizabilityRolloutResponseSchema
>

export function getCertificationizabilityRolloutGuidance() {
  return 'Production certificationizability rollout validates billing invoice certificationizability, billing record certificationizability signals, billing webhook coverage, and scalingization readiness before production certificationizability tooling.'
}
