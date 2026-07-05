import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const corroborizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type CorroborizabilityRolloutCheckStatus = z.infer<
  typeof corroborizabilityRolloutCheckStatusSchema
>

export const corroborizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: corroborizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type CorroborizabilityRolloutCheck = z.infer<typeof corroborizabilityRolloutCheckSchema>

export const corroborizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type CorroborizabilityRolloutStatus = z.infer<typeof corroborizabilityRolloutStatusSchema>

export const corroborizabilityCapabilitiesResponseSchema = z.object({
  supportsCorroborizabilityRollout: z.literal(true),
  supportsCorroborizabilityAdminTools: z.literal(true),
  supportsBillingInvoiceCorroborizabilitySignals: z.literal(true),
  supportsBillingRecordCorroborizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type CorroborizabilityCapabilitiesResponse = z.infer<
  typeof corroborizabilityCapabilitiesResponseSchema
>

export const corroborizabilityRolloutResponseSchema = z.object({
  status: corroborizabilityRolloutStatusSchema,
  checks: z.array(corroborizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type CorroborizabilityRolloutResponse = z.infer<
  typeof corroborizabilityRolloutResponseSchema
>

export function getCorroborizabilityRolloutGuidance() {
  return 'Production corroborizability rollout validates billing invoice corroborizability, billing record corroborizability signals, billing webhook coverage, and corroborization readiness before production corroborizability tooling.'
}
