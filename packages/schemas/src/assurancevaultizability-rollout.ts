import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const assurancevaultizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type AssurancevaultizabilityRolloutCheckStatus = z.infer<
  typeof assurancevaultizabilityRolloutCheckStatusSchema
>

export const assurancevaultizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: assurancevaultizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type AssurancevaultizabilityRolloutCheck = z.infer<typeof assurancevaultizabilityRolloutCheckSchema>

export const assurancevaultizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type AssurancevaultizabilityRolloutStatus = z.infer<typeof assurancevaultizabilityRolloutStatusSchema>

export const assurancevaultizabilityCapabilitiesResponseSchema = z.object({
  supportsAssurancevaultizabilityRollout: z.literal(true),
  supportsAssurancevaultizabilityAdminTools: z.literal(true),
  supportsBillingInvoiceAssurancevaultizabilitySignals: z.literal(true),
  supportsBillingRecordAssurancevaultizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type AssurancevaultizabilityCapabilitiesResponse = z.infer<
  typeof assurancevaultizabilityCapabilitiesResponseSchema
>

export const assurancevaultizabilityRolloutResponseSchema = z.object({
  status: assurancevaultizabilityRolloutStatusSchema,
  checks: z.array(assurancevaultizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type AssurancevaultizabilityRolloutResponse = z.infer<
  typeof assurancevaultizabilityRolloutResponseSchema
>

export function getAssurancevaultizabilityRolloutGuidance() {
  return 'Production assurancevaultizability rollout validates billing invoice assurancevaultizability, billing record assurancevaultizability signals, billing webhook coverage, and scalingization readiness before production assurancevaultizability tooling.'
}
