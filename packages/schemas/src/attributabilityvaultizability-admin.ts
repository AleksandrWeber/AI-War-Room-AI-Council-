import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const attributabilityvaultizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_invoices',
  'billing_records',
])
export type AttributabilityvaultizabilityAdminDomain = z.infer<typeof attributabilityvaultizabilityAdminDomainSchema>

export const attributabilityvaultizabilityAdminRecordSchema = z.object({
  domain: attributabilityvaultizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type AttributabilityvaultizabilityAdminRecord = z.infer<typeof attributabilityvaultizabilityAdminRecordSchema>

export const attributabilityvaultizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  attributabilityvaultizabilityPercent: z.number().min(0).max(100),
})
export type AttributabilityvaultizabilityAdminStats = z.infer<typeof attributabilityvaultizabilityAdminStatsSchema>

export const attributabilityvaultizabilityAdminActionSchema = z.enum(['refresh_attributabilityvaultizability_summary'])
export type AttributabilityvaultizabilityAdminAction = z.infer<typeof attributabilityvaultizabilityAdminActionSchema>

export const attributabilityvaultizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(attributabilityvaultizabilityAdminRecordSchema),
  stats: attributabilityvaultizabilityAdminStatsSchema,
  availableActions: z.array(attributabilityvaultizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type AttributabilityvaultizabilityAdminSummaryResponse = z.infer<
  typeof attributabilityvaultizabilityAdminSummaryResponseSchema
>

export const attributabilityvaultizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: attributabilityvaultizabilityAdminActionSchema,
})
export type AttributabilityvaultizabilityAdminActionRequest = z.infer<
  typeof attributabilityvaultizabilityAdminActionRequestSchema
>

export const attributabilityvaultizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: attributabilityvaultizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: attributabilityvaultizabilityAdminStatsSchema.optional(),
})
export type AttributabilityvaultizabilityAdminActionResponse = z.infer<
  typeof attributabilityvaultizabilityAdminActionResponseSchema
>
