import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const decentralizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type DecentralizabilityRolloutCheckStatus = z.infer<
  typeof decentralizabilityRolloutCheckStatusSchema
>

export const decentralizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: decentralizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type DecentralizabilityRolloutCheck = z.infer<typeof decentralizabilityRolloutCheckSchema>

export const decentralizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type DecentralizabilityRolloutStatus = z.infer<typeof decentralizabilityRolloutStatusSchema>

export const decentralizabilityCapabilitiesResponseSchema = z.object({
  supportsDecentralizabilityRollout: z.literal(true),
  supportsDecentralizabilityAdminTools: z.literal(true),
  supportsProviderCredentialDecentralizabilitySignals: z.literal(true),
  supportsModelRegistryDecentralizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type DecentralizabilityCapabilitiesResponse = z.infer<
  typeof decentralizabilityCapabilitiesResponseSchema
>

export const decentralizabilityRolloutResponseSchema = z.object({
  status: decentralizabilityRolloutStatusSchema,
  checks: z.array(decentralizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type DecentralizabilityRolloutResponse = z.infer<
  typeof decentralizabilityRolloutResponseSchema
>

export function getDecentralizabilityRolloutGuidance() {
  return 'Production decentralizability rollout validates provider credential decentralizability, model registry decentralizability signals, billing webhook coverage, and decentralization readiness before production decentralizability tooling.'
}
