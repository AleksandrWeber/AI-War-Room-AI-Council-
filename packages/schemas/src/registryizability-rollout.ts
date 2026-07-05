import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const registryizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type RegistryizabilityRolloutCheckStatus = z.infer<
  typeof registryizabilityRolloutCheckStatusSchema
>

export const registryizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: registryizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type RegistryizabilityRolloutCheck = z.infer<typeof registryizabilityRolloutCheckSchema>

export const registryizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type RegistryizabilityRolloutStatus = z.infer<typeof registryizabilityRolloutStatusSchema>

export const registryizabilityCapabilitiesResponseSchema = z.object({
  supportsRegistryizabilityRollout: z.literal(true),
  supportsRegistryizabilityAdminTools: z.literal(true),
  supportsBillingNotificationRegistryizabilitySignals: z.literal(true),
  supportsBillingWebhookRegistryizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type RegistryizabilityCapabilitiesResponse = z.infer<
  typeof registryizabilityCapabilitiesResponseSchema
>

export const registryizabilityRolloutResponseSchema = z.object({
  status: registryizabilityRolloutStatusSchema,
  checks: z.array(registryizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type RegistryizabilityRolloutResponse = z.infer<
  typeof registryizabilityRolloutResponseSchema
>

export function getRegistryizabilityRolloutGuidance() {
  return 'Production registryizability rollout validates billing notification registryizability, billing webhook registryizability signals, usage event coverage, and registryization readiness before production registryizability tooling.'
}
