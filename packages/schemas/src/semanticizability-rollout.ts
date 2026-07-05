import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const semanticizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type SemanticizabilityRolloutCheckStatus = z.infer<
  typeof semanticizabilityRolloutCheckStatusSchema
>

export const semanticizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: semanticizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type SemanticizabilityRolloutCheck = z.infer<typeof semanticizabilityRolloutCheckSchema>

export const semanticizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type SemanticizabilityRolloutStatus = z.infer<typeof semanticizabilityRolloutStatusSchema>

export const semanticizabilityCapabilitiesResponseSchema = z.object({
  supportsSemanticizabilityRollout: z.literal(true),
  supportsSemanticizabilityAdminTools: z.literal(true),
  supportsBillingInvoiceSemanticizabilitySignals: z.literal(true),
  supportsBillingRecordSemanticizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type SemanticizabilityCapabilitiesResponse = z.infer<
  typeof semanticizabilityCapabilitiesResponseSchema
>

export const semanticizabilityRolloutResponseSchema = z.object({
  status: semanticizabilityRolloutStatusSchema,
  checks: z.array(semanticizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type SemanticizabilityRolloutResponse = z.infer<
  typeof semanticizabilityRolloutResponseSchema
>

export function getSemanticizabilityRolloutGuidance() {
  return 'Production semanticizability rollout validates billing invoice semanticizability, billing record semanticizability signals, billing webhook coverage, and semanticization readiness before production semanticizability tooling.'
}
