import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const orchestrabilityvaultizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_invoices',
  'billing_records',
])
export type OrchestrabilityvaultizabilityAdminDomain = z.infer<typeof orchestrabilityvaultizabilityAdminDomainSchema>

export const orchestrabilityvaultizabilityAdminRecordSchema = z.object({
  domain: orchestrabilityvaultizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type OrchestrabilityvaultizabilityAdminRecord = z.infer<typeof orchestrabilityvaultizabilityAdminRecordSchema>

export const orchestrabilityvaultizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  orchestrabilityvaultizabilityPercent: z.number().min(0).max(100),
})
export type OrchestrabilityvaultizabilityAdminStats = z.infer<typeof orchestrabilityvaultizabilityAdminStatsSchema>

export const orchestrabilityvaultizabilityAdminActionSchema = z.enum(['refresh_orchestrabilityvaultizability_summary'])
export type OrchestrabilityvaultizabilityAdminAction = z.infer<typeof orchestrabilityvaultizabilityAdminActionSchema>

export const orchestrabilityvaultizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(orchestrabilityvaultizabilityAdminRecordSchema),
  stats: orchestrabilityvaultizabilityAdminStatsSchema,
  availableActions: z.array(orchestrabilityvaultizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type OrchestrabilityvaultizabilityAdminSummaryResponse = z.infer<
  typeof orchestrabilityvaultizabilityAdminSummaryResponseSchema
>

export const orchestrabilityvaultizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: orchestrabilityvaultizabilityAdminActionSchema,
})
export type OrchestrabilityvaultizabilityAdminActionRequest = z.infer<
  typeof orchestrabilityvaultizabilityAdminActionRequestSchema
>

export const orchestrabilityvaultizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: orchestrabilityvaultizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: orchestrabilityvaultizabilityAdminStatsSchema.optional(),
})
export type OrchestrabilityvaultizabilityAdminActionResponse = z.infer<
  typeof orchestrabilityvaultizabilityAdminActionResponseSchema
>
