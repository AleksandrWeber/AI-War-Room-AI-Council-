import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const consolidatizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ConsolidatizabilityRolloutCheckStatus = z.infer<
  typeof consolidatizabilityRolloutCheckStatusSchema
>

export const consolidatizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: consolidatizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ConsolidatizabilityRolloutCheck = z.infer<typeof consolidatizabilityRolloutCheckSchema>

export const consolidatizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ConsolidatizabilityRolloutStatus = z.infer<typeof consolidatizabilityRolloutStatusSchema>

export const consolidatizabilityCapabilitiesResponseSchema = z.object({
  supportsConsolidatizabilityRollout: z.literal(true),
  supportsConsolidatizabilityAdminTools: z.literal(true),
  supportsBillingWebhookConsolidatizabilitySignals: z.literal(true),
  supportsBillingRecordConsolidatizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ConsolidatizabilityCapabilitiesResponse = z.infer<
  typeof consolidatizabilityCapabilitiesResponseSchema
>

export const consolidatizabilityRolloutResponseSchema = z.object({
  status: consolidatizabilityRolloutStatusSchema,
  checks: z.array(consolidatizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ConsolidatizabilityRolloutResponse = z.infer<
  typeof consolidatizabilityRolloutResponseSchema
>

export function getConsolidatizabilityRolloutGuidance() {
  return 'Production consolidatizability rollout validates billing webhook consolidatizability, billing record consolidatizability signals, usage event coverage, and consolidatization readiness before production consolidatizability tooling.'
}
