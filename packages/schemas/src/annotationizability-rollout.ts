import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const annotationizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type AnnotationizabilityRolloutCheckStatus = z.infer<
  typeof annotationizabilityRolloutCheckStatusSchema
>

export const annotationizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: annotationizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type AnnotationizabilityRolloutCheck = z.infer<typeof annotationizabilityRolloutCheckSchema>

export const annotationizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type AnnotationizabilityRolloutStatus = z.infer<typeof annotationizabilityRolloutStatusSchema>

export const annotationizabilityCapabilitiesResponseSchema = z.object({
  supportsAnnotationizabilityRollout: z.literal(true),
  supportsAnnotationizabilityAdminTools: z.literal(true),
  supportsBillingInvoiceAnnotationizabilitySignals: z.literal(true),
  supportsBillingRecordAnnotationizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type AnnotationizabilityCapabilitiesResponse = z.infer<
  typeof annotationizabilityCapabilitiesResponseSchema
>

export const annotationizabilityRolloutResponseSchema = z.object({
  status: annotationizabilityRolloutStatusSchema,
  checks: z.array(annotationizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type AnnotationizabilityRolloutResponse = z.infer<
  typeof annotationizabilityRolloutResponseSchema
>

export function getAnnotationizabilityRolloutGuidance() {
  return 'Production annotationizability rollout validates billing invoice annotationizability, billing record annotationizability signals, billing webhook coverage, and annotationization readiness before production annotationizability tooling.'
}
