import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const verifiabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type VerifiabilityRolloutCheckStatus = z.infer<
  typeof verifiabilityRolloutCheckStatusSchema
>

export const verifiabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: verifiabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type VerifiabilityRolloutCheck = z.infer<typeof verifiabilityRolloutCheckSchema>

export const verifiabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type VerifiabilityRolloutStatus = z.infer<typeof verifiabilityRolloutStatusSchema>

export const verifiabilityCapabilitiesResponseSchema = z.object({
  supportsVerifiabilityRollout: z.literal(true),
  supportsVerifiabilityAdminTools: z.literal(true),
  supportsBillingInvoiceVerifiabilitySignals: z.literal(true),
  supportsBillingWebhookVerifiabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type VerifiabilityCapabilitiesResponse = z.infer<
  typeof verifiabilityCapabilitiesResponseSchema
>

export const verifiabilityRolloutResponseSchema = z.object({
  status: verifiabilityRolloutStatusSchema,
  checks: z.array(verifiabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type VerifiabilityRolloutResponse = z.infer<
  typeof verifiabilityRolloutResponseSchema
>

export function getVerifiabilityRolloutGuidance() {
  return 'Production verifiability rollout validates billing invoice verifiability, billing webhook verifiability signals, meter usage reporting coverage, and evidence readiness before production verifiability tooling.'
}
