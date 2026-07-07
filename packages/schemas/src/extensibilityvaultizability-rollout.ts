import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const extensibilityvaultizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ExtensibilityvaultizabilityRolloutCheckStatus = z.infer<
  typeof extensibilityvaultizabilityRolloutCheckStatusSchema
>

export const extensibilityvaultizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: extensibilityvaultizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ExtensibilityvaultizabilityRolloutCheck = z.infer<typeof extensibilityvaultizabilityRolloutCheckSchema>

export const extensibilityvaultizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ExtensibilityvaultizabilityRolloutStatus = z.infer<typeof extensibilityvaultizabilityRolloutStatusSchema>

export const extensibilityvaultizabilityCapabilitiesResponseSchema = z.object({
  supportsExtensibilityvaultizabilityRollout: z.literal(true),
  supportsExtensibilityvaultizabilityAdminTools: z.literal(true),
  supportsShieldScanExtensibilityvaultizabilitySignals: z.literal(true),
  supportsProviderCredentialExtensibilityvaultizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ExtensibilityvaultizabilityCapabilitiesResponse = z.infer<
  typeof extensibilityvaultizabilityCapabilitiesResponseSchema
>

export const extensibilityvaultizabilityRolloutResponseSchema = z.object({
  status: extensibilityvaultizabilityRolloutStatusSchema,
  checks: z.array(extensibilityvaultizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ExtensibilityvaultizabilityRolloutResponse = z.infer<
  typeof extensibilityvaultizabilityRolloutResponseSchema
>

export function getExtensibilityvaultizabilityRolloutGuidance() {
  return 'Production extensibilityvaultizability rollout validates shield scan extensibilityvaultizability, provider credential extensibilityvaultizability signals, billing webhook coverage, and reconciliationization readiness before production extensibilityvaultizability tooling.'
}
