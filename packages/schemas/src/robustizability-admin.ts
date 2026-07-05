import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const robustizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_invoices',
  'billing_records',
])
export type RobustizabilityAdminDomain = z.infer<typeof robustizabilityAdminDomainSchema>

export const robustizabilityAdminRecordSchema = z.object({
  domain: robustizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type RobustizabilityAdminRecord = z.infer<typeof robustizabilityAdminRecordSchema>

export const robustizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  robustizabilityPercent: z.number().min(0).max(100),
})
export type RobustizabilityAdminStats = z.infer<typeof robustizabilityAdminStatsSchema>

export const robustizabilityAdminActionSchema = z.enum(['refresh_robustizability_summary'])
export type RobustizabilityAdminAction = z.infer<typeof robustizabilityAdminActionSchema>

export const robustizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(robustizabilityAdminRecordSchema),
  stats: robustizabilityAdminStatsSchema,
  availableActions: z.array(robustizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type RobustizabilityAdminSummaryResponse = z.infer<
  typeof robustizabilityAdminSummaryResponseSchema
>

export const robustizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: robustizabilityAdminActionSchema,
})
export type RobustizabilityAdminActionRequest = z.infer<
  typeof robustizabilityAdminActionRequestSchema
>

export const robustizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: robustizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: robustizabilityAdminStatsSchema.optional(),
})
export type RobustizabilityAdminActionResponse = z.infer<
  typeof robustizabilityAdminActionResponseSchema
>
