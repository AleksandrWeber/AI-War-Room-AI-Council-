import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const orchestrabilityvaultizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type OrchestrabilityvaultizabilityRolloutCheckStatus = z.infer<
  typeof orchestrabilityvaultizabilityRolloutCheckStatusSchema
>

export const orchestrabilityvaultizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: orchestrabilityvaultizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type OrchestrabilityvaultizabilityRolloutCheck = z.infer<typeof orchestrabilityvaultizabilityRolloutCheckSchema>

export const orchestrabilityvaultizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type OrchestrabilityvaultizabilityRolloutStatus = z.infer<typeof orchestrabilityvaultizabilityRolloutStatusSchema>

export const orchestrabilityvaultizabilityCapabilitiesResponseSchema = z.object({
  supportsOrchestrabilityvaultizabilityRollout: z.literal(true),
  supportsOrchestrabilityvaultizabilityAdminTools: z.literal(true),
  supportsBillingInvoiceOrchestrabilityvaultizabilitySignals: z.literal(true),
  supportsBillingRecordOrchestrabilityvaultizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type OrchestrabilityvaultizabilityCapabilitiesResponse = z.infer<
  typeof orchestrabilityvaultizabilityCapabilitiesResponseSchema
>

export const orchestrabilityvaultizabilityRolloutResponseSchema = z.object({
  status: orchestrabilityvaultizabilityRolloutStatusSchema,
  checks: z.array(orchestrabilityvaultizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type OrchestrabilityvaultizabilityRolloutResponse = z.infer<
  typeof orchestrabilityvaultizabilityRolloutResponseSchema
>

export function getOrchestrabilityvaultizabilityRolloutGuidance() {
  return 'Production orchestrabilityvaultizability rollout validates billing invoice orchestrabilityvaultizability, billing record orchestrabilityvaultizability signals, billing webhook coverage, and scalingization readiness before production orchestrabilityvaultizability tooling.'
}
