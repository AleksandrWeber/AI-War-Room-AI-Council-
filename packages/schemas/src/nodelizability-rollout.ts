import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const nodelizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type NodelizabilityRolloutCheckStatus = z.infer<
  typeof nodelizabilityRolloutCheckStatusSchema
>

export const nodelizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: nodelizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type NodelizabilityRolloutCheck = z.infer<typeof nodelizabilityRolloutCheckSchema>

export const nodelizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type NodelizabilityRolloutStatus = z.infer<typeof nodelizabilityRolloutStatusSchema>

export const nodelizabilityCapabilitiesResponseSchema = z.object({
  supportsNodelizabilityRollout: z.literal(true),
  supportsNodelizabilityAdminTools: z.literal(true),
  supportsShieldScanNodelizabilitySignals: z.literal(true),
  supportsProviderCredentialNodelizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type NodelizabilityCapabilitiesResponse = z.infer<
  typeof nodelizabilityCapabilitiesResponseSchema
>

export const nodelizabilityRolloutResponseSchema = z.object({
  status: nodelizabilityRolloutStatusSchema,
  checks: z.array(nodelizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type NodelizabilityRolloutResponse = z.infer<
  typeof nodelizabilityRolloutResponseSchema
>

export function getNodelizabilityRolloutGuidance() {
  return 'Production nodelizability rollout validates shield scan nodelizability, provider credential nodelizability signals, billing webhook coverage, and nodelization readiness before production nodelizability tooling.'
}
