import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const searchizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type SearchizabilityRolloutCheckStatus = z.infer<
  typeof searchizabilityRolloutCheckStatusSchema
>

export const searchizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: searchizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type SearchizabilityRolloutCheck = z.infer<typeof searchizabilityRolloutCheckSchema>

export const searchizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type SearchizabilityRolloutStatus = z.infer<typeof searchizabilityRolloutStatusSchema>

export const searchizabilityCapabilitiesResponseSchema = z.object({
  supportsSearchizabilityRollout: z.literal(true),
  supportsSearchizabilityAdminTools: z.literal(true),
  supportsShieldScanSearchizabilitySignals: z.literal(true),
  supportsProviderCredentialSearchizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type SearchizabilityCapabilitiesResponse = z.infer<
  typeof searchizabilityCapabilitiesResponseSchema
>

export const searchizabilityRolloutResponseSchema = z.object({
  status: searchizabilityRolloutStatusSchema,
  checks: z.array(searchizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type SearchizabilityRolloutResponse = z.infer<
  typeof searchizabilityRolloutResponseSchema
>

export function getSearchizabilityRolloutGuidance() {
  return 'Production searchizability rollout validates shield scan searchizability, provider credential searchizability signals, billing webhook coverage, and searchization readiness before production searchizability tooling.'
}
