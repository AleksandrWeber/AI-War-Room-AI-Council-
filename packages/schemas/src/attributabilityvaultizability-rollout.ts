import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const attributabilityvaultizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type AttributabilityvaultizabilityRolloutCheckStatus = z.infer<
  typeof attributabilityvaultizabilityRolloutCheckStatusSchema
>

export const attributabilityvaultizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: attributabilityvaultizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type AttributabilityvaultizabilityRolloutCheck = z.infer<typeof attributabilityvaultizabilityRolloutCheckSchema>

export const attributabilityvaultizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type AttributabilityvaultizabilityRolloutStatus = z.infer<typeof attributabilityvaultizabilityRolloutStatusSchema>

export const attributabilityvaultizabilityCapabilitiesResponseSchema = z.object({
  supportsAttributabilityvaultizabilityRollout: z.literal(true),
  supportsAttributabilityvaultizabilityAdminTools: z.literal(true),
  supportsBillingInvoiceAttributabilityvaultizabilitySignals: z.literal(true),
  supportsBillingRecordAttributabilityvaultizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type AttributabilityvaultizabilityCapabilitiesResponse = z.infer<
  typeof attributabilityvaultizabilityCapabilitiesResponseSchema
>

export const attributabilityvaultizabilityRolloutResponseSchema = z.object({
  status: attributabilityvaultizabilityRolloutStatusSchema,
  checks: z.array(attributabilityvaultizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type AttributabilityvaultizabilityRolloutResponse = z.infer<
  typeof attributabilityvaultizabilityRolloutResponseSchema
>

export function getAttributabilityvaultizabilityRolloutGuidance() {
  return 'Production attributabilityvaultizability rollout validates billing invoice attributabilityvaultizability, billing record attributabilityvaultizability signals, billing webhook coverage, and scalingization readiness before production attributabilityvaultizability tooling.'
}
