import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const catalogizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type CatalogizabilityRolloutCheckStatus = z.infer<
  typeof catalogizabilityRolloutCheckStatusSchema
>

export const catalogizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: catalogizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type CatalogizabilityRolloutCheck = z.infer<typeof catalogizabilityRolloutCheckSchema>

export const catalogizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type CatalogizabilityRolloutStatus = z.infer<typeof catalogizabilityRolloutStatusSchema>

export const catalogizabilityCapabilitiesResponseSchema = z.object({
  supportsCatalogizabilityRollout: z.literal(true),
  supportsCatalogizabilityAdminTools: z.literal(true),
  supportsShieldScanCatalogizabilitySignals: z.literal(true),
  supportsProviderCredentialCatalogizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type CatalogizabilityCapabilitiesResponse = z.infer<
  typeof catalogizabilityCapabilitiesResponseSchema
>

export const catalogizabilityRolloutResponseSchema = z.object({
  status: catalogizabilityRolloutStatusSchema,
  checks: z.array(catalogizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type CatalogizabilityRolloutResponse = z.infer<
  typeof catalogizabilityRolloutResponseSchema
>

export function getCatalogizabilityRolloutGuidance() {
  return 'Production catalogizability rollout validates shield scan catalogizability, provider credential catalogizability signals, billing webhook coverage, and catalogization readiness before production catalogizability tooling.'
}
