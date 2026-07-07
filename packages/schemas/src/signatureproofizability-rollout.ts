import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const signatureproofizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type SignatureproofizabilityRolloutCheckStatus = z.infer<
  typeof signatureproofizabilityRolloutCheckStatusSchema
>

export const signatureproofizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: signatureproofizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type SignatureproofizabilityRolloutCheck = z.infer<typeof signatureproofizabilityRolloutCheckSchema>

export const signatureproofizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type SignatureproofizabilityRolloutStatus = z.infer<typeof signatureproofizabilityRolloutStatusSchema>

export const signatureproofizabilityCapabilitiesResponseSchema = z.object({
  supportsSignatureproofizabilityRollout: z.literal(true),
  supportsSignatureproofizabilityAdminTools: z.literal(true),
  supportsBillingNotificationSignatureproofizabilitySignals: z.literal(true),
  supportsBillingWebhookSignatureproofizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type SignatureproofizabilityCapabilitiesResponse = z.infer<
  typeof signatureproofizabilityCapabilitiesResponseSchema
>

export const signatureproofizabilityRolloutResponseSchema = z.object({
  status: signatureproofizabilityRolloutStatusSchema,
  checks: z.array(signatureproofizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type SignatureproofizabilityRolloutResponse = z.infer<
  typeof signatureproofizabilityRolloutResponseSchema
>

export function getSignatureproofizabilityRolloutGuidance() {
  return 'Production signatureproofizability rollout validates billing notification signatureproofizability, billing webhook signatureproofizability signals, usage event coverage, and governanceization readiness before production signatureproofizability tooling.'
}
