import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const entitlementizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_invoices',
  'billing_records',
])
export type EntitlementizabilityAdminDomain = z.infer<typeof entitlementizabilityAdminDomainSchema>

export const entitlementizabilityAdminRecordSchema = z.object({
  domain: entitlementizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type EntitlementizabilityAdminRecord = z.infer<typeof entitlementizabilityAdminRecordSchema>

export const entitlementizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  entitlementizabilityPercent: z.number().min(0).max(100),
})
export type EntitlementizabilityAdminStats = z.infer<typeof entitlementizabilityAdminStatsSchema>

export const entitlementizabilityAdminActionSchema = z.enum(['refresh_entitlementizability_summary'])
export type EntitlementizabilityAdminAction = z.infer<typeof entitlementizabilityAdminActionSchema>

export const entitlementizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(entitlementizabilityAdminRecordSchema),
  stats: entitlementizabilityAdminStatsSchema,
  availableActions: z.array(entitlementizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type EntitlementizabilityAdminSummaryResponse = z.infer<
  typeof entitlementizabilityAdminSummaryResponseSchema
>

export const entitlementizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: entitlementizabilityAdminActionSchema,
})
export type EntitlementizabilityAdminActionRequest = z.infer<
  typeof entitlementizabilityAdminActionRequestSchema
>

export const entitlementizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: entitlementizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: entitlementizabilityAdminStatsSchema.optional(),
})
export type EntitlementizabilityAdminActionResponse = z.infer<
  typeof entitlementizabilityAdminActionResponseSchema
>
