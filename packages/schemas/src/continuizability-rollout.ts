import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const continuizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ContinuizabilityRolloutCheckStatus = z.infer<
  typeof continuizabilityRolloutCheckStatusSchema
>

export const continuizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: continuizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ContinuizabilityRolloutCheck = z.infer<typeof continuizabilityRolloutCheckSchema>

export const continuizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ContinuizabilityRolloutStatus = z.infer<typeof continuizabilityRolloutStatusSchema>

export const continuizabilityCapabilitiesResponseSchema = z.object({
  supportsContinuizabilityRollout: z.literal(true),
  supportsContinuizabilityAdminTools: z.literal(true),
  supportsProviderCredentialContinuizabilitySignals: z.literal(true),
  supportsModelRegistryContinuizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ContinuizabilityCapabilitiesResponse = z.infer<
  typeof continuizabilityCapabilitiesResponseSchema
>

export const continuizabilityRolloutResponseSchema = z.object({
  status: continuizabilityRolloutStatusSchema,
  checks: z.array(continuizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ContinuizabilityRolloutResponse = z.infer<
  typeof continuizabilityRolloutResponseSchema
>

export function getContinuizabilityRolloutGuidance() {
  return 'Production continuizability rollout validates provider credential continuizability, model registry continuizability signals, billing webhook coverage, and continuization readiness before production continuizability tooling.'
}
