import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const compatibilityvaultizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type CompatibilityvaultizabilityRolloutCheckStatus = z.infer<
  typeof compatibilityvaultizabilityRolloutCheckStatusSchema
>

export const compatibilityvaultizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: compatibilityvaultizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type CompatibilityvaultizabilityRolloutCheck = z.infer<typeof compatibilityvaultizabilityRolloutCheckSchema>

export const compatibilityvaultizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type CompatibilityvaultizabilityRolloutStatus = z.infer<typeof compatibilityvaultizabilityRolloutStatusSchema>

export const compatibilityvaultizabilityCapabilitiesResponseSchema = z.object({
  supportsCompatibilityvaultizabilityRollout: z.literal(true),
  supportsCompatibilityvaultizabilityAdminTools: z.literal(true),
  supportsBillingInvoiceCompatibilityvaultizabilitySignals: z.literal(true),
  supportsBillingRecordCompatibilityvaultizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type CompatibilityvaultizabilityCapabilitiesResponse = z.infer<
  typeof compatibilityvaultizabilityCapabilitiesResponseSchema
>

export const compatibilityvaultizabilityRolloutResponseSchema = z.object({
  status: compatibilityvaultizabilityRolloutStatusSchema,
  checks: z.array(compatibilityvaultizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type CompatibilityvaultizabilityRolloutResponse = z.infer<
  typeof compatibilityvaultizabilityRolloutResponseSchema
>

export function getCompatibilityvaultizabilityRolloutGuidance() {
  return 'Production compatibilityvaultizability rollout validates billing invoice compatibilityvaultizability, billing record compatibilityvaultizability signals, billing webhook coverage, and scalingization readiness before production compatibilityvaultizability tooling.'
}
