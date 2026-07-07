import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const certifiabilityvaultizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type CertifiabilityvaultizabilityRolloutCheckStatus = z.infer<
  typeof certifiabilityvaultizabilityRolloutCheckStatusSchema
>

export const certifiabilityvaultizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: certifiabilityvaultizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type CertifiabilityvaultizabilityRolloutCheck = z.infer<typeof certifiabilityvaultizabilityRolloutCheckSchema>

export const certifiabilityvaultizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type CertifiabilityvaultizabilityRolloutStatus = z.infer<typeof certifiabilityvaultizabilityRolloutStatusSchema>

export const certifiabilityvaultizabilityCapabilitiesResponseSchema = z.object({
  supportsCertifiabilityvaultizabilityRollout: z.literal(true),
  supportsCertifiabilityvaultizabilityAdminTools: z.literal(true),
  supportsIdempotencyKeyCertifiabilityvaultizabilitySignals: z.literal(true),
  supportsUsageEventCertifiabilityvaultizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type CertifiabilityvaultizabilityCapabilitiesResponse = z.infer<
  typeof certifiabilityvaultizabilityCapabilitiesResponseSchema
>

export const certifiabilityvaultizabilityRolloutResponseSchema = z.object({
  status: certifiabilityvaultizabilityRolloutStatusSchema,
  checks: z.array(certifiabilityvaultizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type CertifiabilityvaultizabilityRolloutResponse = z.infer<
  typeof certifiabilityvaultizabilityRolloutResponseSchema
>

export function getCertifiabilityvaultizabilityRolloutGuidance() {
  return 'Production certifiabilityvaultizability rollout validates idempotency key certifiabilityvaultizability, usage event certifiabilityvaultizability signals, billing webhook coverage, and remediationization readiness before production certifiabilityvaultizability tooling.'
}
