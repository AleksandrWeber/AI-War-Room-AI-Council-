import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const diagnosabilizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type DiagnosabilizabilityRolloutCheckStatus = z.infer<
  typeof diagnosabilizabilityRolloutCheckStatusSchema
>

export const diagnosabilizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: diagnosabilizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type DiagnosabilizabilityRolloutCheck = z.infer<typeof diagnosabilizabilityRolloutCheckSchema>

export const diagnosabilizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type DiagnosabilizabilityRolloutStatus = z.infer<typeof diagnosabilizabilityRolloutStatusSchema>

export const diagnosabilizabilityCapabilitiesResponseSchema = z.object({
  supportsDiagnosabilizabilityRollout: z.literal(true),
  supportsDiagnosabilizabilityAdminTools: z.literal(true),
  supportsBillingInvoiceDiagnosabilizabilitySignals: z.literal(true),
  supportsBillingRecordDiagnosabilizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type DiagnosabilizabilityCapabilitiesResponse = z.infer<
  typeof diagnosabilizabilityCapabilitiesResponseSchema
>

export const diagnosabilizabilityRolloutResponseSchema = z.object({
  status: diagnosabilizabilityRolloutStatusSchema,
  checks: z.array(diagnosabilizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type DiagnosabilizabilityRolloutResponse = z.infer<
  typeof diagnosabilizabilityRolloutResponseSchema
>

export function getDiagnosabilizabilityRolloutGuidance() {
  return 'Production diagnosabilizability rollout validates billing invoice diagnosabilizability, billing record diagnosabilizability signals, billing webhook coverage, and diagnosabilization readiness before production diagnosabilizability tooling.'
}
