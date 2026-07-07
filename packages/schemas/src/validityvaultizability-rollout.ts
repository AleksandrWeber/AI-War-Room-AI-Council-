import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const validityvaultizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ValidityvaultizabilityRolloutCheckStatus = z.infer<
  typeof validityvaultizabilityRolloutCheckStatusSchema
>

export const validityvaultizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: validityvaultizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ValidityvaultizabilityRolloutCheck = z.infer<typeof validityvaultizabilityRolloutCheckSchema>

export const validityvaultizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ValidityvaultizabilityRolloutStatus = z.infer<typeof validityvaultizabilityRolloutStatusSchema>

export const validityvaultizabilityCapabilitiesResponseSchema = z.object({
  supportsValidityvaultizabilityRollout: z.literal(true),
  supportsValidityvaultizabilityAdminTools: z.literal(true),
  supportsBillingInvoiceValidityvaultizabilitySignals: z.literal(true),
  supportsBillingRecordValidityvaultizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ValidityvaultizabilityCapabilitiesResponse = z.infer<
  typeof validityvaultizabilityCapabilitiesResponseSchema
>

export const validityvaultizabilityRolloutResponseSchema = z.object({
  status: validityvaultizabilityRolloutStatusSchema,
  checks: z.array(validityvaultizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ValidityvaultizabilityRolloutResponse = z.infer<
  typeof validityvaultizabilityRolloutResponseSchema
>

export function getValidityvaultizabilityRolloutGuidance() {
  return 'Production validityvaultizability rollout validates billing invoice validityvaultizability, billing record validityvaultizability signals, billing webhook coverage, and scalingization readiness before production validityvaultizability tooling.'
}
