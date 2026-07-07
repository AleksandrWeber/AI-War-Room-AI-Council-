import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const transferabilityvaultizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type TransferabilityvaultizabilityRolloutCheckStatus = z.infer<
  typeof transferabilityvaultizabilityRolloutCheckStatusSchema
>

export const transferabilityvaultizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: transferabilityvaultizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type TransferabilityvaultizabilityRolloutCheck = z.infer<typeof transferabilityvaultizabilityRolloutCheckSchema>

export const transferabilityvaultizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type TransferabilityvaultizabilityRolloutStatus = z.infer<typeof transferabilityvaultizabilityRolloutStatusSchema>

export const transferabilityvaultizabilityCapabilitiesResponseSchema = z.object({
  supportsTransferabilityvaultizabilityRollout: z.literal(true),
  supportsTransferabilityvaultizabilityAdminTools: z.literal(true),
  supportsShieldScanTransferabilityvaultizabilitySignals: z.literal(true),
  supportsProviderCredentialTransferabilityvaultizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type TransferabilityvaultizabilityCapabilitiesResponse = z.infer<
  typeof transferabilityvaultizabilityCapabilitiesResponseSchema
>

export const transferabilityvaultizabilityRolloutResponseSchema = z.object({
  status: transferabilityvaultizabilityRolloutStatusSchema,
  checks: z.array(transferabilityvaultizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type TransferabilityvaultizabilityRolloutResponse = z.infer<
  typeof transferabilityvaultizabilityRolloutResponseSchema
>

export function getTransferabilityvaultizabilityRolloutGuidance() {
  return 'Production transferabilityvaultizability rollout validates shield scan transferabilityvaultizability, provider credential transferabilityvaultizability signals, billing webhook coverage, and reconciliationization readiness before production transferabilityvaultizability tooling.'
}
