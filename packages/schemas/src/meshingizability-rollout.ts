import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const meshingizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type MeshingizabilityRolloutCheckStatus = z.infer<
  typeof meshingizabilityRolloutCheckStatusSchema
>

export const meshingizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: meshingizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type MeshingizabilityRolloutCheck = z.infer<typeof meshingizabilityRolloutCheckSchema>

export const meshingizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type MeshingizabilityRolloutStatus = z.infer<typeof meshingizabilityRolloutStatusSchema>

export const meshingizabilityCapabilitiesResponseSchema = z.object({
  supportsMeshingizabilityRollout: z.literal(true),
  supportsMeshingizabilityAdminTools: z.literal(true),
  supportsBillingNotificationMeshingizabilitySignals: z.literal(true),
  supportsBillingWebhookMeshingizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type MeshingizabilityCapabilitiesResponse = z.infer<
  typeof meshingizabilityCapabilitiesResponseSchema
>

export const meshingizabilityRolloutResponseSchema = z.object({
  status: meshingizabilityRolloutStatusSchema,
  checks: z.array(meshingizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type MeshingizabilityRolloutResponse = z.infer<
  typeof meshingizabilityRolloutResponseSchema
>

export function getMeshingizabilityRolloutGuidance() {
  return 'Production meshingizability rollout validates billing notification meshingizability, billing webhook meshingizability signals, usage event coverage, and meshingization readiness before production meshingizability tooling.'
}
