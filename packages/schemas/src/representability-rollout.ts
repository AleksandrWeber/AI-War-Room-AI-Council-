import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const representabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type RepresentabilityRolloutCheckStatus = z.infer<
  typeof representabilityRolloutCheckStatusSchema
>

export const representabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: representabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type RepresentabilityRolloutCheck = z.infer<typeof representabilityRolloutCheckSchema>

export const representabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type RepresentabilityRolloutStatus = z.infer<typeof representabilityRolloutStatusSchema>

export const representabilityCapabilitiesResponseSchema = z.object({
  supportsRepresentabilityRollout: z.literal(true),
  supportsRepresentabilityAdminTools: z.literal(true),
  supportsBillingInvoiceRepresentabilitySignals: z.literal(true),
  supportsBillingRecordRepresentabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type RepresentabilityCapabilitiesResponse = z.infer<
  typeof representabilityCapabilitiesResponseSchema
>

export const representabilityRolloutResponseSchema = z.object({
  status: representabilityRolloutStatusSchema,
  checks: z.array(representabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type RepresentabilityRolloutResponse = z.infer<
  typeof representabilityRolloutResponseSchema
>

export function getRepresentabilityRolloutGuidance() {
  return 'Production representability rollout validates billing invoice representability, billing record representability signals, billing webhook coverage, and representation readiness before production representability tooling.'
}
