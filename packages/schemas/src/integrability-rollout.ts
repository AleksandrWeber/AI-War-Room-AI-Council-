import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const integrabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type IntegrabilityRolloutCheckStatus = z.infer<
  typeof integrabilityRolloutCheckStatusSchema
>

export const integrabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: integrabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type IntegrabilityRolloutCheck = z.infer<typeof integrabilityRolloutCheckSchema>

export const integrabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type IntegrabilityRolloutStatus = z.infer<typeof integrabilityRolloutStatusSchema>

export const integrabilityCapabilitiesResponseSchema = z.object({
  supportsIntegrabilityRollout: z.literal(true),
  supportsIntegrabilityAdminTools: z.literal(true),
  supportsBillingWebhookIntegrabilitySignals: z.literal(true),
  supportsMeterUsageIntegrabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type IntegrabilityCapabilitiesResponse = z.infer<
  typeof integrabilityCapabilitiesResponseSchema
>

export const integrabilityRolloutResponseSchema = z.object({
  status: integrabilityRolloutStatusSchema,
  checks: z.array(integrabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type IntegrabilityRolloutResponse = z.infer<
  typeof integrabilityRolloutResponseSchema
>

export function getIntegrabilityRolloutGuidance() {
  return 'Production integrability rollout validates billing webhook integrability, meter usage integrability signals, workspace membership coverage, and integration readiness before production integrability tooling.'
}
