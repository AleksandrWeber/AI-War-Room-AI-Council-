import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const transferabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type TransferabilityRolloutCheckStatus = z.infer<
  typeof transferabilityRolloutCheckStatusSchema
>

export const transferabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: transferabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type TransferabilityRolloutCheck = z.infer<typeof transferabilityRolloutCheckSchema>

export const transferabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type TransferabilityRolloutStatus = z.infer<typeof transferabilityRolloutStatusSchema>

export const transferabilityCapabilitiesResponseSchema = z.object({
  supportsTransferabilityRollout: z.literal(true),
  supportsTransferabilityAdminTools: z.literal(true),
  supportsBillingRecordTransferabilitySignals: z.literal(true),
  supportsBillingInvoiceTransferabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type TransferabilityCapabilitiesResponse = z.infer<
  typeof transferabilityCapabilitiesResponseSchema
>

export const transferabilityRolloutResponseSchema = z.object({
  status: transferabilityRolloutStatusSchema,
  checks: z.array(transferabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type TransferabilityRolloutResponse = z.infer<
  typeof transferabilityRolloutResponseSchema
>

export function getTransferabilityRolloutGuidance() {
  return 'Production transferability rollout validates billing record transferability, billing invoice transferability signals, billing notification coverage, and transfer readiness before production transferability tooling.'
}
