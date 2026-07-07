import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const configurabilityvaultizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ConfigurabilityvaultizabilityRolloutCheckStatus = z.infer<
  typeof configurabilityvaultizabilityRolloutCheckStatusSchema
>

export const configurabilityvaultizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: configurabilityvaultizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ConfigurabilityvaultizabilityRolloutCheck = z.infer<typeof configurabilityvaultizabilityRolloutCheckSchema>

export const configurabilityvaultizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ConfigurabilityvaultizabilityRolloutStatus = z.infer<typeof configurabilityvaultizabilityRolloutStatusSchema>

export const configurabilityvaultizabilityCapabilitiesResponseSchema = z.object({
  supportsConfigurabilityvaultizabilityRollout: z.literal(true),
  supportsConfigurabilityvaultizabilityAdminTools: z.literal(true),
  supportsBillingInvoiceConfigurabilityvaultizabilitySignals: z.literal(true),
  supportsBillingRecordConfigurabilityvaultizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ConfigurabilityvaultizabilityCapabilitiesResponse = z.infer<
  typeof configurabilityvaultizabilityCapabilitiesResponseSchema
>

export const configurabilityvaultizabilityRolloutResponseSchema = z.object({
  status: configurabilityvaultizabilityRolloutStatusSchema,
  checks: z.array(configurabilityvaultizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ConfigurabilityvaultizabilityRolloutResponse = z.infer<
  typeof configurabilityvaultizabilityRolloutResponseSchema
>

export function getConfigurabilityvaultizabilityRolloutGuidance() {
  return 'Production configurabilityvaultizability rollout validates billing invoice configurabilityvaultizability, billing record configurabilityvaultizability signals, billing webhook coverage, and scalingization readiness before production configurabilityvaultizability tooling.'
}
