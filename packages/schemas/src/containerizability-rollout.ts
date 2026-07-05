import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const containerizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ContainerizabilityRolloutCheckStatus = z.infer<
  typeof containerizabilityRolloutCheckStatusSchema
>

export const containerizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: containerizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ContainerizabilityRolloutCheck = z.infer<typeof containerizabilityRolloutCheckSchema>

export const containerizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ContainerizabilityRolloutStatus = z.infer<typeof containerizabilityRolloutStatusSchema>

export const containerizabilityCapabilitiesResponseSchema = z.object({
  supportsContainerizabilityRollout: z.literal(true),
  supportsContainerizabilityAdminTools: z.literal(true),
  supportsBillingInvoiceContainerizabilitySignals: z.literal(true),
  supportsBillingRecordContainerizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ContainerizabilityCapabilitiesResponse = z.infer<
  typeof containerizabilityCapabilitiesResponseSchema
>

export const containerizabilityRolloutResponseSchema = z.object({
  status: containerizabilityRolloutStatusSchema,
  checks: z.array(containerizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ContainerizabilityRolloutResponse = z.infer<
  typeof containerizabilityRolloutResponseSchema
>

export function getContainerizabilityRolloutGuidance() {
  return 'Production containerizability rollout validates billing invoice containerizability, billing record containerizability signals, billing webhook coverage, and containerization readiness before production containerizability tooling.'
}
