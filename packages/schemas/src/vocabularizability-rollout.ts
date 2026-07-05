import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const vocabularizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type VocabularizabilityRolloutCheckStatus = z.infer<
  typeof vocabularizabilityRolloutCheckStatusSchema
>

export const vocabularizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: vocabularizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type VocabularizabilityRolloutCheck = z.infer<typeof vocabularizabilityRolloutCheckSchema>

export const vocabularizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type VocabularizabilityRolloutStatus = z.infer<typeof vocabularizabilityRolloutStatusSchema>

export const vocabularizabilityCapabilitiesResponseSchema = z.object({
  supportsVocabularizabilityRollout: z.literal(true),
  supportsVocabularizabilityAdminTools: z.literal(true),
  supportsBillingInvoiceVocabularizabilitySignals: z.literal(true),
  supportsBillingRecordVocabularizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type VocabularizabilityCapabilitiesResponse = z.infer<
  typeof vocabularizabilityCapabilitiesResponseSchema
>

export const vocabularizabilityRolloutResponseSchema = z.object({
  status: vocabularizabilityRolloutStatusSchema,
  checks: z.array(vocabularizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type VocabularizabilityRolloutResponse = z.infer<
  typeof vocabularizabilityRolloutResponseSchema
>

export function getVocabularizabilityRolloutGuidance() {
  return 'Production vocabularizability rollout validates billing invoice vocabularizability, billing record vocabularizability signals, billing webhook coverage, and vocabularization readiness before production vocabularizability tooling.'
}
