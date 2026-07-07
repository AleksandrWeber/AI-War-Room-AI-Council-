import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const warrantabilityvaultizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type WarrantabilityvaultizabilityRolloutCheckStatus = z.infer<
  typeof warrantabilityvaultizabilityRolloutCheckStatusSchema
>

export const warrantabilityvaultizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: warrantabilityvaultizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type WarrantabilityvaultizabilityRolloutCheck = z.infer<typeof warrantabilityvaultizabilityRolloutCheckSchema>

export const warrantabilityvaultizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type WarrantabilityvaultizabilityRolloutStatus = z.infer<typeof warrantabilityvaultizabilityRolloutStatusSchema>

export const warrantabilityvaultizabilityCapabilitiesResponseSchema = z.object({
  supportsWarrantabilityvaultizabilityRollout: z.literal(true),
  supportsWarrantabilityvaultizabilityAdminTools: z.literal(true),
  supportsBillingNotificationWarrantabilityvaultizabilitySignals: z.literal(true),
  supportsBillingWebhookWarrantabilityvaultizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type WarrantabilityvaultizabilityCapabilitiesResponse = z.infer<
  typeof warrantabilityvaultizabilityCapabilitiesResponseSchema
>

export const warrantabilityvaultizabilityRolloutResponseSchema = z.object({
  status: warrantabilityvaultizabilityRolloutStatusSchema,
  checks: z.array(warrantabilityvaultizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type WarrantabilityvaultizabilityRolloutResponse = z.infer<
  typeof warrantabilityvaultizabilityRolloutResponseSchema
>

export function getWarrantabilityvaultizabilityRolloutGuidance() {
  return 'Production warrantabilityvaultizability rollout validates billing notification warrantabilityvaultizability, billing webhook warrantabilityvaultizability signals, usage event coverage, and governanceization readiness before production warrantabilityvaultizability tooling.'
}
