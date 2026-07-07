import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const compatibilityvaultizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_invoices',
  'billing_records',
])
export type CompatibilityvaultizabilityAdminDomain = z.infer<typeof compatibilityvaultizabilityAdminDomainSchema>

export const compatibilityvaultizabilityAdminRecordSchema = z.object({
  domain: compatibilityvaultizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type CompatibilityvaultizabilityAdminRecord = z.infer<typeof compatibilityvaultizabilityAdminRecordSchema>

export const compatibilityvaultizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  compatibilityvaultizabilityPercent: z.number().min(0).max(100),
})
export type CompatibilityvaultizabilityAdminStats = z.infer<typeof compatibilityvaultizabilityAdminStatsSchema>

export const compatibilityvaultizabilityAdminActionSchema = z.enum(['refresh_compatibilityvaultizability_summary'])
export type CompatibilityvaultizabilityAdminAction = z.infer<typeof compatibilityvaultizabilityAdminActionSchema>

export const compatibilityvaultizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(compatibilityvaultizabilityAdminRecordSchema),
  stats: compatibilityvaultizabilityAdminStatsSchema,
  availableActions: z.array(compatibilityvaultizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type CompatibilityvaultizabilityAdminSummaryResponse = z.infer<
  typeof compatibilityvaultizabilityAdminSummaryResponseSchema
>

export const compatibilityvaultizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: compatibilityvaultizabilityAdminActionSchema,
})
export type CompatibilityvaultizabilityAdminActionRequest = z.infer<
  typeof compatibilityvaultizabilityAdminActionRequestSchema
>

export const compatibilityvaultizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: compatibilityvaultizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: compatibilityvaultizabilityAdminStatsSchema.optional(),
})
export type CompatibilityvaultizabilityAdminActionResponse = z.infer<
  typeof compatibilityvaultizabilityAdminActionResponseSchema
>
