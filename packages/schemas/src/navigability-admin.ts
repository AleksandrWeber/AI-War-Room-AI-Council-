import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const navigabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'run_workflows',
  'billing_invoices',
])
export type NavigabilityAdminDomain = z.infer<typeof navigabilityAdminDomainSchema>

export const navigabilityAdminRecordSchema = z.object({
  domain: navigabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type NavigabilityAdminRecord = z.infer<typeof navigabilityAdminRecordSchema>

export const navigabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  navigabilityPercent: z.number().min(0).max(100),
})
export type NavigabilityAdminStats = z.infer<typeof navigabilityAdminStatsSchema>

export const navigabilityAdminActionSchema = z.enum(['refresh_navigability_summary'])
export type NavigabilityAdminAction = z.infer<typeof navigabilityAdminActionSchema>

export const navigabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(navigabilityAdminRecordSchema),
  stats: navigabilityAdminStatsSchema,
  availableActions: z.array(navigabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type NavigabilityAdminSummaryResponse = z.infer<
  typeof navigabilityAdminSummaryResponseSchema
>

export const navigabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: navigabilityAdminActionSchema,
})
export type NavigabilityAdminActionRequest = z.infer<
  typeof navigabilityAdminActionRequestSchema
>

export const navigabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: navigabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: navigabilityAdminStatsSchema.optional(),
})
export type NavigabilityAdminActionResponse = z.infer<
  typeof navigabilityAdminActionResponseSchema
>
