import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const customizabilityvaultizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_memberships',
  'usage_events',
])
export type CustomizabilityvaultizabilityAdminDomain = z.infer<typeof customizabilityvaultizabilityAdminDomainSchema>

export const customizabilityvaultizabilityAdminRecordSchema = z.object({
  domain: customizabilityvaultizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type CustomizabilityvaultizabilityAdminRecord = z.infer<typeof customizabilityvaultizabilityAdminRecordSchema>

export const customizabilityvaultizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  customizabilityvaultizabilityPercent: z.number().min(0).max(100),
})
export type CustomizabilityvaultizabilityAdminStats = z.infer<typeof customizabilityvaultizabilityAdminStatsSchema>

export const customizabilityvaultizabilityAdminActionSchema = z.enum(['refresh_customizabilityvaultizability_summary'])
export type CustomizabilityvaultizabilityAdminAction = z.infer<typeof customizabilityvaultizabilityAdminActionSchema>

export const customizabilityvaultizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(customizabilityvaultizabilityAdminRecordSchema),
  stats: customizabilityvaultizabilityAdminStatsSchema,
  availableActions: z.array(customizabilityvaultizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type CustomizabilityvaultizabilityAdminSummaryResponse = z.infer<
  typeof customizabilityvaultizabilityAdminSummaryResponseSchema
>

export const customizabilityvaultizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: customizabilityvaultizabilityAdminActionSchema,
})
export type CustomizabilityvaultizabilityAdminActionRequest = z.infer<
  typeof customizabilityvaultizabilityAdminActionRequestSchema
>

export const customizabilityvaultizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: customizabilityvaultizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: customizabilityvaultizabilityAdminStatsSchema.optional(),
})
export type CustomizabilityvaultizabilityAdminActionResponse = z.infer<
  typeof customizabilityvaultizabilityAdminActionResponseSchema
>
