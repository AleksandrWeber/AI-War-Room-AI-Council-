import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const paginizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type PaginizabilityRolloutCheckStatus = z.infer<
  typeof paginizabilityRolloutCheckStatusSchema
>

export const paginizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: paginizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type PaginizabilityRolloutCheck = z.infer<typeof paginizabilityRolloutCheckSchema>

export const paginizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type PaginizabilityRolloutStatus = z.infer<typeof paginizabilityRolloutStatusSchema>

export const paginizabilityCapabilitiesResponseSchema = z.object({
  supportsPaginizabilityRollout: z.literal(true),
  supportsPaginizabilityAdminTools: z.literal(true),
  supportsProviderCredentialPaginizabilitySignals: z.literal(true),
  supportsModelRegistryPaginizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type PaginizabilityCapabilitiesResponse = z.infer<
  typeof paginizabilityCapabilitiesResponseSchema
>

export const paginizabilityRolloutResponseSchema = z.object({
  status: paginizabilityRolloutStatusSchema,
  checks: z.array(paginizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type PaginizabilityRolloutResponse = z.infer<
  typeof paginizabilityRolloutResponseSchema
>

export function getPaginizabilityRolloutGuidance() {
  return 'Production paginizability rollout validates provider credential paginizability, model registry paginizability signals, billing webhook coverage, and paginization readiness before production paginizability tooling.'
}
