import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const certifiabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type CertifiabilityRolloutCheckStatus = z.infer<
  typeof certifiabilityRolloutCheckStatusSchema
>

export const certifiabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: certifiabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type CertifiabilityRolloutCheck = z.infer<typeof certifiabilityRolloutCheckSchema>

export const certifiabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type CertifiabilityRolloutStatus = z.infer<typeof certifiabilityRolloutStatusSchema>

export const certifiabilityCapabilitiesResponseSchema = z.object({
  supportsCertifiabilityRollout: z.literal(true),
  supportsCertifiabilityAdminTools: z.literal(true),
  supportsProviderCredentialCertifiabilitySignals: z.literal(true),
  supportsModelRegistryCertifiabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type CertifiabilityCapabilitiesResponse = z.infer<
  typeof certifiabilityCapabilitiesResponseSchema
>

export const certifiabilityRolloutResponseSchema = z.object({
  status: certifiabilityRolloutStatusSchema,
  checks: z.array(certifiabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type CertifiabilityRolloutResponse = z.infer<
  typeof certifiabilityRolloutResponseSchema
>

export function getCertifiabilityRolloutGuidance() {
  return 'Production certifiability rollout validates provider credential certifiability, model registry certifiability signals, billing webhook coverage, and certification readiness before production certifiability tooling.'
}
