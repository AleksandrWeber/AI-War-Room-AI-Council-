import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const assessabilityvaultizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type AssessabilityvaultizabilityRolloutCheckStatus = z.infer<
  typeof assessabilityvaultizabilityRolloutCheckStatusSchema
>

export const assessabilityvaultizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: assessabilityvaultizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type AssessabilityvaultizabilityRolloutCheck = z.infer<typeof assessabilityvaultizabilityRolloutCheckSchema>

export const assessabilityvaultizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type AssessabilityvaultizabilityRolloutStatus = z.infer<typeof assessabilityvaultizabilityRolloutStatusSchema>

export const assessabilityvaultizabilityCapabilitiesResponseSchema = z.object({
  supportsAssessabilityvaultizabilityRollout: z.literal(true),
  supportsAssessabilityvaultizabilityAdminTools: z.literal(true),
  supportsBillingInvoiceAssessabilityvaultizabilitySignals: z.literal(true),
  supportsBillingRecordAssessabilityvaultizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type AssessabilityvaultizabilityCapabilitiesResponse = z.infer<
  typeof assessabilityvaultizabilityCapabilitiesResponseSchema
>

export const assessabilityvaultizabilityRolloutResponseSchema = z.object({
  status: assessabilityvaultizabilityRolloutStatusSchema,
  checks: z.array(assessabilityvaultizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type AssessabilityvaultizabilityRolloutResponse = z.infer<
  typeof assessabilityvaultizabilityRolloutResponseSchema
>

export function getAssessabilityvaultizabilityRolloutGuidance() {
  return 'Production assessabilityvaultizability rollout validates billing invoice assessabilityvaultizability, billing record assessabilityvaultizability signals, billing webhook coverage, and scalingization readiness before production assessabilityvaultizability tooling.'
}
