import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const interfabilizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type InterfabilizabilityRolloutCheckStatus = z.infer<
  typeof interfabilizabilityRolloutCheckStatusSchema
>

export const interfabilizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: interfabilizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type InterfabilizabilityRolloutCheck = z.infer<typeof interfabilizabilityRolloutCheckSchema>

export const interfabilizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type InterfabilizabilityRolloutStatus = z.infer<typeof interfabilizabilityRolloutStatusSchema>

export const interfabilizabilityCapabilitiesResponseSchema = z.object({
  supportsInterfabilizabilityRollout: z.literal(true),
  supportsInterfabilizabilityAdminTools: z.literal(true),
  supportsProviderCredentialInterfabilizabilitySignals: z.literal(true),
  supportsModelRegistryInterfabilizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type InterfabilizabilityCapabilitiesResponse = z.infer<
  typeof interfabilizabilityCapabilitiesResponseSchema
>

export const interfabilizabilityRolloutResponseSchema = z.object({
  status: interfabilizabilityRolloutStatusSchema,
  checks: z.array(interfabilizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type InterfabilizabilityRolloutResponse = z.infer<
  typeof interfabilizabilityRolloutResponseSchema
>

export function getInterfabilizabilityRolloutGuidance() {
  return 'Production interfabilizability rollout validates provider credential interfabilizability, model registry interfabilizability signals, billing webhook coverage, and interfabization readiness before production interfabilizability tooling.'
}
