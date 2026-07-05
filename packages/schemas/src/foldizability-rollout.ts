import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const foldizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type FoldizabilityRolloutCheckStatus = z.infer<
  typeof foldizabilityRolloutCheckStatusSchema
>

export const foldizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: foldizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type FoldizabilityRolloutCheck = z.infer<typeof foldizabilityRolloutCheckSchema>

export const foldizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type FoldizabilityRolloutStatus = z.infer<typeof foldizabilityRolloutStatusSchema>

export const foldizabilityCapabilitiesResponseSchema = z.object({
  supportsFoldizabilityRollout: z.literal(true),
  supportsFoldizabilityAdminTools: z.literal(true),
  supportsProviderCredentialFoldizabilitySignals: z.literal(true),
  supportsModelRegistryFoldizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type FoldizabilityCapabilitiesResponse = z.infer<
  typeof foldizabilityCapabilitiesResponseSchema
>

export const foldizabilityRolloutResponseSchema = z.object({
  status: foldizabilityRolloutStatusSchema,
  checks: z.array(foldizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type FoldizabilityRolloutResponse = z.infer<
  typeof foldizabilityRolloutResponseSchema
>

export function getFoldizabilityRolloutGuidance() {
  return 'Production foldizability rollout validates provider credential foldizability, model registry foldizability signals, billing webhook coverage, and foldization readiness before production foldizability tooling.'
}
