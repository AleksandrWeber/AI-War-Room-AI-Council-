import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const dependabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type DependabilityRolloutCheckStatus = z.infer<
  typeof dependabilityRolloutCheckStatusSchema
>

export const dependabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: dependabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type DependabilityRolloutCheck = z.infer<typeof dependabilityRolloutCheckSchema>

export const dependabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type DependabilityRolloutStatus = z.infer<typeof dependabilityRolloutStatusSchema>

export const dependabilityCapabilitiesResponseSchema = z.object({
  supportsDependabilityRollout: z.literal(true),
  supportsDependabilityAdminTools: z.literal(true),
  supportsBillingRecordDependabilitySignals: z.literal(true),
  supportsBillingInvoiceDependabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type DependabilityCapabilitiesResponse = z.infer<
  typeof dependabilityCapabilitiesResponseSchema
>

export const dependabilityRolloutResponseSchema = z.object({
  status: dependabilityRolloutStatusSchema,
  checks: z.array(dependabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type DependabilityRolloutResponse = z.infer<
  typeof dependabilityRolloutResponseSchema
>

export function getDependabilityRolloutGuidance() {
  return 'Production dependability rollout validates billing record dependability, billing invoice dependability signals, billing notification coverage, and dependency readiness before production dependability tooling.'
}
