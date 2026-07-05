import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const circuitizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type CircuitizabilityRolloutCheckStatus = z.infer<
  typeof circuitizabilityRolloutCheckStatusSchema
>

export const circuitizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: circuitizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type CircuitizabilityRolloutCheck = z.infer<typeof circuitizabilityRolloutCheckSchema>

export const circuitizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type CircuitizabilityRolloutStatus = z.infer<typeof circuitizabilityRolloutStatusSchema>

export const circuitizabilityCapabilitiesResponseSchema = z.object({
  supportsCircuitizabilityRollout: z.literal(true),
  supportsCircuitizabilityAdminTools: z.literal(true),
  supportsBillingInvoiceCircuitizabilitySignals: z.literal(true),
  supportsBillingRecordCircuitizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type CircuitizabilityCapabilitiesResponse = z.infer<
  typeof circuitizabilityCapabilitiesResponseSchema
>

export const circuitizabilityRolloutResponseSchema = z.object({
  status: circuitizabilityRolloutStatusSchema,
  checks: z.array(circuitizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type CircuitizabilityRolloutResponse = z.infer<
  typeof circuitizabilityRolloutResponseSchema
>

export function getCircuitizabilityRolloutGuidance() {
  return 'Production circuitizability rollout validates billing invoice circuitizability, billing record circuitizability signals, billing webhook coverage, and circuitization readiness before production circuitizability tooling.'
}
