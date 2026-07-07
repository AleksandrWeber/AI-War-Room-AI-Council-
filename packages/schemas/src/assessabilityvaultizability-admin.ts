import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const assessabilityvaultizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_invoices',
  'billing_records',
])
export type AssessabilityvaultizabilityAdminDomain = z.infer<typeof assessabilityvaultizabilityAdminDomainSchema>

export const assessabilityvaultizabilityAdminRecordSchema = z.object({
  domain: assessabilityvaultizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type AssessabilityvaultizabilityAdminRecord = z.infer<typeof assessabilityvaultizabilityAdminRecordSchema>

export const assessabilityvaultizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  assessabilityvaultizabilityPercent: z.number().min(0).max(100),
})
export type AssessabilityvaultizabilityAdminStats = z.infer<typeof assessabilityvaultizabilityAdminStatsSchema>

export const assessabilityvaultizabilityAdminActionSchema = z.enum(['refresh_assessabilityvaultizability_summary'])
export type AssessabilityvaultizabilityAdminAction = z.infer<typeof assessabilityvaultizabilityAdminActionSchema>

export const assessabilityvaultizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(assessabilityvaultizabilityAdminRecordSchema),
  stats: assessabilityvaultizabilityAdminStatsSchema,
  availableActions: z.array(assessabilityvaultizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type AssessabilityvaultizabilityAdminSummaryResponse = z.infer<
  typeof assessabilityvaultizabilityAdminSummaryResponseSchema
>

export const assessabilityvaultizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: assessabilityvaultizabilityAdminActionSchema,
})
export type AssessabilityvaultizabilityAdminActionRequest = z.infer<
  typeof assessabilityvaultizabilityAdminActionRequestSchema
>

export const assessabilityvaultizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: assessabilityvaultizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: assessabilityvaultizabilityAdminStatsSchema.optional(),
})
export type AssessabilityvaultizabilityAdminActionResponse = z.infer<
  typeof assessabilityvaultizabilityAdminActionResponseSchema
>
