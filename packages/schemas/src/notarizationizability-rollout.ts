import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const notarizationizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type NotarizationizabilityRolloutCheckStatus = z.infer<
  typeof notarizationizabilityRolloutCheckStatusSchema
>

export const notarizationizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: notarizationizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type NotarizationizabilityRolloutCheck = z.infer<typeof notarizationizabilityRolloutCheckSchema>

export const notarizationizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type NotarizationizabilityRolloutStatus = z.infer<typeof notarizationizabilityRolloutStatusSchema>

export const notarizationizabilityCapabilitiesResponseSchema = z.object({
  supportsNotarizationizabilityRollout: z.literal(true),
  supportsNotarizationizabilityAdminTools: z.literal(true),
  supportsMembershipNotarizationizabilitySignals: z.literal(true),
  supportsUsageEventNotarizationizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type NotarizationizabilityCapabilitiesResponse = z.infer<
  typeof notarizationizabilityCapabilitiesResponseSchema
>

export const notarizationizabilityRolloutResponseSchema = z.object({
  status: notarizationizabilityRolloutStatusSchema,
  checks: z.array(notarizationizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type NotarizationizabilityRolloutResponse = z.infer<
  typeof notarizationizabilityRolloutResponseSchema
>

export function getNotarizationizabilityRolloutGuidance() {
  return 'Production notarizationizability rollout validates membership notarizationizability, usage event notarizationizability signals, billing notification coverage, and healingization readiness before production notarizationizability tooling.'
}
