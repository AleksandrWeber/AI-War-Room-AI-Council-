import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const customizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'run_workflows',
  'usage_events',
])
export type CustomizabilityAdminDomain = z.infer<typeof customizabilityAdminDomainSchema>

export const customizabilityAdminRecordSchema = z.object({
  domain: customizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type CustomizabilityAdminRecord = z.infer<typeof customizabilityAdminRecordSchema>

export const customizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  customizabilityPercent: z.number().min(0).max(100),
})
export type CustomizabilityAdminStats = z.infer<typeof customizabilityAdminStatsSchema>

export const customizabilityAdminActionSchema = z.enum(['refresh_customizability_summary'])
export type CustomizabilityAdminAction = z.infer<typeof customizabilityAdminActionSchema>

export const customizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(customizabilityAdminRecordSchema),
  stats: customizabilityAdminStatsSchema,
  availableActions: z.array(customizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type CustomizabilityAdminSummaryResponse = z.infer<
  typeof customizabilityAdminSummaryResponseSchema
>

export const customizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: customizabilityAdminActionSchema,
})
export type CustomizabilityAdminActionRequest = z.infer<
  typeof customizabilityAdminActionRequestSchema
>

export const customizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: customizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: customizabilityAdminStatsSchema.optional(),
})
export type CustomizabilityAdminActionResponse = z.infer<
  typeof customizabilityAdminActionResponseSchema
>
