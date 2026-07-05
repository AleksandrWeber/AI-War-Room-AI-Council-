import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const compressizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type CompressizabilityRolloutCheckStatus = z.infer<
  typeof compressizabilityRolloutCheckStatusSchema
>

export const compressizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: compressizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type CompressizabilityRolloutCheck = z.infer<typeof compressizabilityRolloutCheckSchema>

export const compressizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type CompressizabilityRolloutStatus = z.infer<typeof compressizabilityRolloutStatusSchema>

export const compressizabilityCapabilitiesResponseSchema = z.object({
  supportsCompressizabilityRollout: z.literal(true),
  supportsCompressizabilityAdminTools: z.literal(true),
  supportsMembershipCompressizabilitySignals: z.literal(true),
  supportsUsageEventCompressizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type CompressizabilityCapabilitiesResponse = z.infer<
  typeof compressizabilityCapabilitiesResponseSchema
>

export const compressizabilityRolloutResponseSchema = z.object({
  status: compressizabilityRolloutStatusSchema,
  checks: z.array(compressizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type CompressizabilityRolloutResponse = z.infer<
  typeof compressizabilityRolloutResponseSchema
>

export function getCompressizabilityRolloutGuidance() {
  return 'Production compressizability rollout validates membership compressizability, usage event compressizability signals, billing notification coverage, and compressization readiness before production compressizability tooling.'
}
