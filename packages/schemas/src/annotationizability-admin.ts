import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const annotationizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_invoices',
  'billing_records',
])
export type AnnotationizabilityAdminDomain = z.infer<typeof annotationizabilityAdminDomainSchema>

export const annotationizabilityAdminRecordSchema = z.object({
  domain: annotationizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type AnnotationizabilityAdminRecord = z.infer<typeof annotationizabilityAdminRecordSchema>

export const annotationizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  annotationizabilityPercent: z.number().min(0).max(100),
})
export type AnnotationizabilityAdminStats = z.infer<typeof annotationizabilityAdminStatsSchema>

export const annotationizabilityAdminActionSchema = z.enum(['refresh_annotationizability_summary'])
export type AnnotationizabilityAdminAction = z.infer<typeof annotationizabilityAdminActionSchema>

export const annotationizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(annotationizabilityAdminRecordSchema),
  stats: annotationizabilityAdminStatsSchema,
  availableActions: z.array(annotationizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type AnnotationizabilityAdminSummaryResponse = z.infer<
  typeof annotationizabilityAdminSummaryResponseSchema
>

export const annotationizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: annotationizabilityAdminActionSchema,
})
export type AnnotationizabilityAdminActionRequest = z.infer<
  typeof annotationizabilityAdminActionRequestSchema
>

export const annotationizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: annotationizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: annotationizabilityAdminStatsSchema.optional(),
})
export type AnnotationizabilityAdminActionResponse = z.infer<
  typeof annotationizabilityAdminActionResponseSchema
>
