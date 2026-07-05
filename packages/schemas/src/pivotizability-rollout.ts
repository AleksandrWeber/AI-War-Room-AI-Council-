import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const pivotizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type PivotizabilityRolloutCheckStatus = z.infer<
  typeof pivotizabilityRolloutCheckStatusSchema
>

export const pivotizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: pivotizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type PivotizabilityRolloutCheck = z.infer<typeof pivotizabilityRolloutCheckSchema>

export const pivotizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type PivotizabilityRolloutStatus = z.infer<typeof pivotizabilityRolloutStatusSchema>

export const pivotizabilityCapabilitiesResponseSchema = z.object({
  supportsPivotizabilityRollout: z.literal(true),
  supportsPivotizabilityAdminTools: z.literal(true),
  supportsModelHealthPivotizabilitySignals: z.literal(true),
  supportsModelRegistryPivotizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type PivotizabilityCapabilitiesResponse = z.infer<
  typeof pivotizabilityCapabilitiesResponseSchema
>

export const pivotizabilityRolloutResponseSchema = z.object({
  status: pivotizabilityRolloutStatusSchema,
  checks: z.array(pivotizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type PivotizabilityRolloutResponse = z.infer<
  typeof pivotizabilityRolloutResponseSchema
>

export function getPivotizabilityRolloutGuidance() {
  return 'Production pivotizability rollout validates model health pivotizability, model registry pivotizability signals, billing record coverage, and optimization readiness before production pivotizability tooling.'
}
