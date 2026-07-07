import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const referencabilityvaultizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ReferencabilityvaultizabilityRolloutCheckStatus = z.infer<
  typeof referencabilityvaultizabilityRolloutCheckStatusSchema
>

export const referencabilityvaultizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: referencabilityvaultizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ReferencabilityvaultizabilityRolloutCheck = z.infer<typeof referencabilityvaultizabilityRolloutCheckSchema>

export const referencabilityvaultizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ReferencabilityvaultizabilityRolloutStatus = z.infer<typeof referencabilityvaultizabilityRolloutStatusSchema>

export const referencabilityvaultizabilityCapabilitiesResponseSchema = z.object({
  supportsReferencabilityvaultizabilityRollout: z.literal(true),
  supportsReferencabilityvaultizabilityAdminTools: z.literal(true),
  supportsBillingInvoiceReferencabilityvaultizabilitySignals: z.literal(true),
  supportsBillingRecordReferencabilityvaultizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ReferencabilityvaultizabilityCapabilitiesResponse = z.infer<
  typeof referencabilityvaultizabilityCapabilitiesResponseSchema
>

export const referencabilityvaultizabilityRolloutResponseSchema = z.object({
  status: referencabilityvaultizabilityRolloutStatusSchema,
  checks: z.array(referencabilityvaultizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ReferencabilityvaultizabilityRolloutResponse = z.infer<
  typeof referencabilityvaultizabilityRolloutResponseSchema
>

export function getReferencabilityvaultizabilityRolloutGuidance() {
  return 'Production referencabilityvaultizability rollout validates billing invoice referencabilityvaultizability, billing record referencabilityvaultizability signals, billing webhook coverage, and scalingization readiness before production referencabilityvaultizability tooling.'
}
