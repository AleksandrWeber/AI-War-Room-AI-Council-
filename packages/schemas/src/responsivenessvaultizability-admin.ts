import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const responsivenessvaultizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_memberships',
  'usage_events',
])
export type ResponsivenessvaultizabilityAdminDomain = z.infer<typeof responsivenessvaultizabilityAdminDomainSchema>

export const responsivenessvaultizabilityAdminRecordSchema = z.object({
  domain: responsivenessvaultizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ResponsivenessvaultizabilityAdminRecord = z.infer<typeof responsivenessvaultizabilityAdminRecordSchema>

export const responsivenessvaultizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  responsivenessvaultizabilityPercent: z.number().min(0).max(100),
})
export type ResponsivenessvaultizabilityAdminStats = z.infer<typeof responsivenessvaultizabilityAdminStatsSchema>

export const responsivenessvaultizabilityAdminActionSchema = z.enum(['refresh_responsivenessvaultizability_summary'])
export type ResponsivenessvaultizabilityAdminAction = z.infer<typeof responsivenessvaultizabilityAdminActionSchema>

export const responsivenessvaultizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(responsivenessvaultizabilityAdminRecordSchema),
  stats: responsivenessvaultizabilityAdminStatsSchema,
  availableActions: z.array(responsivenessvaultizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ResponsivenessvaultizabilityAdminSummaryResponse = z.infer<
  typeof responsivenessvaultizabilityAdminSummaryResponseSchema
>

export const responsivenessvaultizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: responsivenessvaultizabilityAdminActionSchema,
})
export type ResponsivenessvaultizabilityAdminActionRequest = z.infer<
  typeof responsivenessvaultizabilityAdminActionRequestSchema
>

export const responsivenessvaultizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: responsivenessvaultizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: responsivenessvaultizabilityAdminStatsSchema.optional(),
})
export type ResponsivenessvaultizabilityAdminActionResponse = z.infer<
  typeof responsivenessvaultizabilityAdminActionResponseSchema
>
