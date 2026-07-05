import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const decompressizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type DecompressizabilityRolloutCheckStatus = z.infer<
  typeof decompressizabilityRolloutCheckStatusSchema
>

export const decompressizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: decompressizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type DecompressizabilityRolloutCheck = z.infer<typeof decompressizabilityRolloutCheckSchema>

export const decompressizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type DecompressizabilityRolloutStatus = z.infer<typeof decompressizabilityRolloutStatusSchema>

export const decompressizabilityCapabilitiesResponseSchema = z.object({
  supportsDecompressizabilityRollout: z.literal(true),
  supportsDecompressizabilityAdminTools: z.literal(true),
  supportsBillingInvoiceDecompressizabilitySignals: z.literal(true),
  supportsBillingRecordDecompressizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type DecompressizabilityCapabilitiesResponse = z.infer<
  typeof decompressizabilityCapabilitiesResponseSchema
>

export const decompressizabilityRolloutResponseSchema = z.object({
  status: decompressizabilityRolloutStatusSchema,
  checks: z.array(decompressizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type DecompressizabilityRolloutResponse = z.infer<
  typeof decompressizabilityRolloutResponseSchema
>

export function getDecompressizabilityRolloutGuidance() {
  return 'Production decompressizability rollout validates billing invoice decompressizability, billing record decompressizability signals, billing webhook coverage, and decompressization readiness before production decompressizability tooling.'
}
