import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const repeatabilityvaultizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type RepeatabilityvaultizabilityRolloutCheckStatus = z.infer<
  typeof repeatabilityvaultizabilityRolloutCheckStatusSchema
>

export const repeatabilityvaultizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: repeatabilityvaultizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type RepeatabilityvaultizabilityRolloutCheck = z.infer<typeof repeatabilityvaultizabilityRolloutCheckSchema>

export const repeatabilityvaultizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type RepeatabilityvaultizabilityRolloutStatus = z.infer<typeof repeatabilityvaultizabilityRolloutStatusSchema>

export const repeatabilityvaultizabilityCapabilitiesResponseSchema = z.object({
  supportsRepeatabilityvaultizabilityRollout: z.literal(true),
  supportsRepeatabilityvaultizabilityAdminTools: z.literal(true),
  supportsBillingInvoiceRepeatabilityvaultizabilitySignals: z.literal(true),
  supportsBillingRecordRepeatabilityvaultizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type RepeatabilityvaultizabilityCapabilitiesResponse = z.infer<
  typeof repeatabilityvaultizabilityCapabilitiesResponseSchema
>

export const repeatabilityvaultizabilityRolloutResponseSchema = z.object({
  status: repeatabilityvaultizabilityRolloutStatusSchema,
  checks: z.array(repeatabilityvaultizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type RepeatabilityvaultizabilityRolloutResponse = z.infer<
  typeof repeatabilityvaultizabilityRolloutResponseSchema
>

export function getRepeatabilityvaultizabilityRolloutGuidance() {
  return 'Production repeatabilityvaultizability rollout validates billing invoice repeatabilityvaultizability, billing record repeatabilityvaultizability signals, billing webhook coverage, and scalingization readiness before production repeatabilityvaultizability tooling.'
}
