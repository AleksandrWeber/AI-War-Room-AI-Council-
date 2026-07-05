import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const followerizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type FollowerizabilityRolloutCheckStatus = z.infer<
  typeof followerizabilityRolloutCheckStatusSchema
>

export const followerizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: followerizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type FollowerizabilityRolloutCheck = z.infer<typeof followerizabilityRolloutCheckSchema>

export const followerizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type FollowerizabilityRolloutStatus = z.infer<typeof followerizabilityRolloutStatusSchema>

export const followerizabilityCapabilitiesResponseSchema = z.object({
  supportsFollowerizabilityRollout: z.literal(true),
  supportsFollowerizabilityAdminTools: z.literal(true),
  supportsProviderCredentialFollowerizabilitySignals: z.literal(true),
  supportsModelRegistryFollowerizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type FollowerizabilityCapabilitiesResponse = z.infer<
  typeof followerizabilityCapabilitiesResponseSchema
>

export const followerizabilityRolloutResponseSchema = z.object({
  status: followerizabilityRolloutStatusSchema,
  checks: z.array(followerizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type FollowerizabilityRolloutResponse = z.infer<
  typeof followerizabilityRolloutResponseSchema
>

export function getFollowerizabilityRolloutGuidance() {
  return 'Production followerizability rollout validates provider credential followerizability, model registry followerizability signals, billing webhook coverage, and followerization readiness before production followerizability tooling.'
}
