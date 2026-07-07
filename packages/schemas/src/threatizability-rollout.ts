import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const threatizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ThreatizabilityRolloutCheckStatus = z.infer<
  typeof threatizabilityRolloutCheckStatusSchema
>

export const threatizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: threatizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ThreatizabilityRolloutCheck = z.infer<typeof threatizabilityRolloutCheckSchema>

export const threatizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ThreatizabilityRolloutStatus = z.infer<typeof threatizabilityRolloutStatusSchema>

export const threatizabilityCapabilitiesResponseSchema = z.object({
  supportsThreatizabilityRollout: z.literal(true),
  supportsThreatizabilityAdminTools: z.literal(true),
  supportsBillingInvoiceThreatizabilitySignals: z.literal(true),
  supportsBillingRecordThreatizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ThreatizabilityCapabilitiesResponse = z.infer<
  typeof threatizabilityCapabilitiesResponseSchema
>

export const threatizabilityRolloutResponseSchema = z.object({
  status: threatizabilityRolloutStatusSchema,
  checks: z.array(threatizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ThreatizabilityRolloutResponse = z.infer<
  typeof threatizabilityRolloutResponseSchema
>

export function getThreatizabilityRolloutGuidance() {
  return 'Production threatizability rollout validates billing invoice threatizability, billing record threatizability signals, billing webhook coverage, and scalingization readiness before production threatizability tooling.'
}
