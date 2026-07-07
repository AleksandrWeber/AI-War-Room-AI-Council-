import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const connectabilityvaultizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ConnectabilityvaultizabilityRolloutCheckStatus = z.infer<
  typeof connectabilityvaultizabilityRolloutCheckStatusSchema
>

export const connectabilityvaultizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: connectabilityvaultizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ConnectabilityvaultizabilityRolloutCheck = z.infer<typeof connectabilityvaultizabilityRolloutCheckSchema>

export const connectabilityvaultizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ConnectabilityvaultizabilityRolloutStatus = z.infer<typeof connectabilityvaultizabilityRolloutStatusSchema>

export const connectabilityvaultizabilityCapabilitiesResponseSchema = z.object({
  supportsConnectabilityvaultizabilityRollout: z.literal(true),
  supportsConnectabilityvaultizabilityAdminTools: z.literal(true),
  supportsBillingInvoiceConnectabilityvaultizabilitySignals: z.literal(true),
  supportsBillingRecordConnectabilityvaultizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ConnectabilityvaultizabilityCapabilitiesResponse = z.infer<
  typeof connectabilityvaultizabilityCapabilitiesResponseSchema
>

export const connectabilityvaultizabilityRolloutResponseSchema = z.object({
  status: connectabilityvaultizabilityRolloutStatusSchema,
  checks: z.array(connectabilityvaultizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ConnectabilityvaultizabilityRolloutResponse = z.infer<
  typeof connectabilityvaultizabilityRolloutResponseSchema
>

export function getConnectabilityvaultizabilityRolloutGuidance() {
  return 'Production connectabilityvaultizability rollout validates billing invoice connectabilityvaultizability, billing record connectabilityvaultizability signals, billing webhook coverage, and scalingization readiness before production connectabilityvaultizability tooling.'
}
