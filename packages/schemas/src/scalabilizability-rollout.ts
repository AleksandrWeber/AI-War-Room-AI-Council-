import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const scalabilizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ScalabilizabilityRolloutCheckStatus = z.infer<
  typeof scalabilizabilityRolloutCheckStatusSchema
>

export const scalabilizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: scalabilizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ScalabilizabilityRolloutCheck = z.infer<typeof scalabilizabilityRolloutCheckSchema>

export const scalabilizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ScalabilizabilityRolloutStatus = z.infer<typeof scalabilizabilityRolloutStatusSchema>

export const scalabilizabilityCapabilitiesResponseSchema = z.object({
  supportsScalabilizabilityRollout: z.literal(true),
  supportsScalabilizabilityAdminTools: z.literal(true),
  supportsShieldScanScalabilizabilitySignals: z.literal(true),
  supportsProviderCredentialScalabilizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ScalabilizabilityCapabilitiesResponse = z.infer<
  typeof scalabilizabilityCapabilitiesResponseSchema
>

export const scalabilizabilityRolloutResponseSchema = z.object({
  status: scalabilizabilityRolloutStatusSchema,
  checks: z.array(scalabilizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ScalabilizabilityRolloutResponse = z.infer<
  typeof scalabilizabilityRolloutResponseSchema
>

export function getScalabilizabilityRolloutGuidance() {
  return 'Production scalabilizability rollout validates shield scan scalabilizability, provider credential scalabilizability signals, billing webhook coverage, and scalabilization readiness before production scalabilizability tooling.'
}
