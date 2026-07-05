import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const phenomenizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type PhenomenizabilityRolloutCheckStatus = z.infer<
  typeof phenomenizabilityRolloutCheckStatusSchema
>

export const phenomenizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: phenomenizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type PhenomenizabilityRolloutCheck = z.infer<typeof phenomenizabilityRolloutCheckSchema>

export const phenomenizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type PhenomenizabilityRolloutStatus = z.infer<typeof phenomenizabilityRolloutStatusSchema>

export const phenomenizabilityCapabilitiesResponseSchema = z.object({
  supportsPhenomenizabilityRollout: z.literal(true),
  supportsPhenomenizabilityAdminTools: z.literal(true),
  supportsBillingInvoicePhenomenizabilitySignals: z.literal(true),
  supportsBillingRecordPhenomenizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type PhenomenizabilityCapabilitiesResponse = z.infer<
  typeof phenomenizabilityCapabilitiesResponseSchema
>

export const phenomenizabilityRolloutResponseSchema = z.object({
  status: phenomenizabilityRolloutStatusSchema,
  checks: z.array(phenomenizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type PhenomenizabilityRolloutResponse = z.infer<
  typeof phenomenizabilityRolloutResponseSchema
>

export function getPhenomenizabilityRolloutGuidance() {
  return 'Production phenomenizability rollout validates billing invoice phenomenizability, billing record phenomenizability signals, billing webhook coverage, and phenomenization readiness before production phenomenizability tooling.'
}
