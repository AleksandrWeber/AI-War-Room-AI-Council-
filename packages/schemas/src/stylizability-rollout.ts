import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const stylizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type StylizabilityRolloutCheckStatus = z.infer<
  typeof stylizabilityRolloutCheckStatusSchema
>

export const stylizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: stylizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type StylizabilityRolloutCheck = z.infer<typeof stylizabilityRolloutCheckSchema>

export const stylizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type StylizabilityRolloutStatus = z.infer<typeof stylizabilityRolloutStatusSchema>

export const stylizabilityCapabilitiesResponseSchema = z.object({
  supportsStylizabilityRollout: z.literal(true),
  supportsStylizabilityAdminTools: z.literal(true),
  supportsBillingInvoiceStylizabilitySignals: z.literal(true),
  supportsBillingRecordStylizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type StylizabilityCapabilitiesResponse = z.infer<
  typeof stylizabilityCapabilitiesResponseSchema
>

export const stylizabilityRolloutResponseSchema = z.object({
  status: stylizabilityRolloutStatusSchema,
  checks: z.array(stylizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type StylizabilityRolloutResponse = z.infer<
  typeof stylizabilityRolloutResponseSchema
>

export function getStylizabilityRolloutGuidance() {
  return 'Production stylizability rollout validates billing invoice stylizability, billing record stylizability signals, billing webhook coverage, and stylization readiness before production stylizability tooling.'
}
