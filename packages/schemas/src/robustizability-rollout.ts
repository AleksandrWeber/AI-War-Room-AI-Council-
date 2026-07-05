import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const robustizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type RobustizabilityRolloutCheckStatus = z.infer<
  typeof robustizabilityRolloutCheckStatusSchema
>

export const robustizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: robustizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type RobustizabilityRolloutCheck = z.infer<typeof robustizabilityRolloutCheckSchema>

export const robustizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type RobustizabilityRolloutStatus = z.infer<typeof robustizabilityRolloutStatusSchema>

export const robustizabilityCapabilitiesResponseSchema = z.object({
  supportsRobustizabilityRollout: z.literal(true),
  supportsRobustizabilityAdminTools: z.literal(true),
  supportsBillingInvoiceRobustizabilitySignals: z.literal(true),
  supportsBillingRecordRobustizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type RobustizabilityCapabilitiesResponse = z.infer<
  typeof robustizabilityCapabilitiesResponseSchema
>

export const robustizabilityRolloutResponseSchema = z.object({
  status: robustizabilityRolloutStatusSchema,
  checks: z.array(robustizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type RobustizabilityRolloutResponse = z.infer<
  typeof robustizabilityRolloutResponseSchema
>

export function getRobustizabilityRolloutGuidance() {
  return 'Production robustizability rollout validates billing invoice robustizability, billing record robustizability signals, billing webhook coverage, and robustization readiness before production robustizability tooling.'
}
