import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const defensibilityvaultizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type DefensibilityvaultizabilityRolloutCheckStatus = z.infer<
  typeof defensibilityvaultizabilityRolloutCheckStatusSchema
>

export const defensibilityvaultizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: defensibilityvaultizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type DefensibilityvaultizabilityRolloutCheck = z.infer<typeof defensibilityvaultizabilityRolloutCheckSchema>

export const defensibilityvaultizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type DefensibilityvaultizabilityRolloutStatus = z.infer<typeof defensibilityvaultizabilityRolloutStatusSchema>

export const defensibilityvaultizabilityCapabilitiesResponseSchema = z.object({
  supportsDefensibilityvaultizabilityRollout: z.literal(true),
  supportsDefensibilityvaultizabilityAdminTools: z.literal(true),
  supportsBillingInvoiceDefensibilityvaultizabilitySignals: z.literal(true),
  supportsBillingRecordDefensibilityvaultizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type DefensibilityvaultizabilityCapabilitiesResponse = z.infer<
  typeof defensibilityvaultizabilityCapabilitiesResponseSchema
>

export const defensibilityvaultizabilityRolloutResponseSchema = z.object({
  status: defensibilityvaultizabilityRolloutStatusSchema,
  checks: z.array(defensibilityvaultizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type DefensibilityvaultizabilityRolloutResponse = z.infer<
  typeof defensibilityvaultizabilityRolloutResponseSchema
>

export function getDefensibilityvaultizabilityRolloutGuidance() {
  return 'Production defensibilityvaultizability rollout validates billing invoice defensibilityvaultizability, billing record defensibilityvaultizability signals, billing webhook coverage, and scalingization readiness before production defensibilityvaultizability tooling.'
}
