import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const connectabilityvaultizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_invoices',
  'billing_records',
])
export type ConnectabilityvaultizabilityAdminDomain = z.infer<typeof connectabilityvaultizabilityAdminDomainSchema>

export const connectabilityvaultizabilityAdminRecordSchema = z.object({
  domain: connectabilityvaultizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ConnectabilityvaultizabilityAdminRecord = z.infer<typeof connectabilityvaultizabilityAdminRecordSchema>

export const connectabilityvaultizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  connectabilityvaultizabilityPercent: z.number().min(0).max(100),
})
export type ConnectabilityvaultizabilityAdminStats = z.infer<typeof connectabilityvaultizabilityAdminStatsSchema>

export const connectabilityvaultizabilityAdminActionSchema = z.enum(['refresh_connectabilityvaultizability_summary'])
export type ConnectabilityvaultizabilityAdminAction = z.infer<typeof connectabilityvaultizabilityAdminActionSchema>

export const connectabilityvaultizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(connectabilityvaultizabilityAdminRecordSchema),
  stats: connectabilityvaultizabilityAdminStatsSchema,
  availableActions: z.array(connectabilityvaultizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ConnectabilityvaultizabilityAdminSummaryResponse = z.infer<
  typeof connectabilityvaultizabilityAdminSummaryResponseSchema
>

export const connectabilityvaultizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: connectabilityvaultizabilityAdminActionSchema,
})
export type ConnectabilityvaultizabilityAdminActionRequest = z.infer<
  typeof connectabilityvaultizabilityAdminActionRequestSchema
>

export const connectabilityvaultizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: connectabilityvaultizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: connectabilityvaultizabilityAdminStatsSchema.optional(),
})
export type ConnectabilityvaultizabilityAdminActionResponse = z.infer<
  typeof connectabilityvaultizabilityAdminActionResponseSchema
>
