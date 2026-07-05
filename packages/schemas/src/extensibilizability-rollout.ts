import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const extensibilizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ExtensibilizabilityRolloutCheckStatus = z.infer<
  typeof extensibilizabilityRolloutCheckStatusSchema
>

export const extensibilizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: extensibilizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ExtensibilizabilityRolloutCheck = z.infer<typeof extensibilizabilityRolloutCheckSchema>

export const extensibilizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ExtensibilizabilityRolloutStatus = z.infer<typeof extensibilizabilityRolloutStatusSchema>

export const extensibilizabilityCapabilitiesResponseSchema = z.object({
  supportsExtensibilizabilityRollout: z.literal(true),
  supportsExtensibilizabilityAdminTools: z.literal(true),
  supportsBillingInvoiceExtensibilizabilitySignals: z.literal(true),
  supportsBillingRecordExtensibilizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ExtensibilizabilityCapabilitiesResponse = z.infer<
  typeof extensibilizabilityCapabilitiesResponseSchema
>

export const extensibilizabilityRolloutResponseSchema = z.object({
  status: extensibilizabilityRolloutStatusSchema,
  checks: z.array(extensibilizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ExtensibilizabilityRolloutResponse = z.infer<
  typeof extensibilizabilityRolloutResponseSchema
>

export function getExtensibilizabilityRolloutGuidance() {
  return 'Production extensibilizability rollout validates billing invoice extensibilizability, billing record extensibilizability signals, billing webhook coverage, and extensibilization readiness before production extensibilizability tooling.'
}
