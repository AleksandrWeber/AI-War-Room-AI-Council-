import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const integrityizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type IntegrityizabilityRolloutCheckStatus = z.infer<
  typeof integrityizabilityRolloutCheckStatusSchema
>

export const integrityizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: integrityizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type IntegrityizabilityRolloutCheck = z.infer<typeof integrityizabilityRolloutCheckSchema>

export const integrityizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type IntegrityizabilityRolloutStatus = z.infer<typeof integrityizabilityRolloutStatusSchema>

export const integrityizabilityCapabilitiesResponseSchema = z.object({
  supportsIntegrityizabilityRollout: z.literal(true),
  supportsIntegrityizabilityAdminTools: z.literal(true),
  supportsBillingNotificationIntegrityizabilitySignals: z.literal(true),
  supportsBillingWebhookIntegrityizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type IntegrityizabilityCapabilitiesResponse = z.infer<
  typeof integrityizabilityCapabilitiesResponseSchema
>

export const integrityizabilityRolloutResponseSchema = z.object({
  status: integrityizabilityRolloutStatusSchema,
  checks: z.array(integrityizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type IntegrityizabilityRolloutResponse = z.infer<
  typeof integrityizabilityRolloutResponseSchema
>

export function getIntegrityizabilityRolloutGuidance() {
  return 'Production integrityizability rollout validates billing notification integrityizability, billing webhook integrityizability signals, usage event coverage, and governanceization readiness before production integrityizability tooling.'
}
