import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const defensibilityvaultizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_invoices',
  'billing_records',
])
export type DefensibilityvaultizabilityAdminDomain = z.infer<typeof defensibilityvaultizabilityAdminDomainSchema>

export const defensibilityvaultizabilityAdminRecordSchema = z.object({
  domain: defensibilityvaultizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type DefensibilityvaultizabilityAdminRecord = z.infer<typeof defensibilityvaultizabilityAdminRecordSchema>

export const defensibilityvaultizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  defensibilityvaultizabilityPercent: z.number().min(0).max(100),
})
export type DefensibilityvaultizabilityAdminStats = z.infer<typeof defensibilityvaultizabilityAdminStatsSchema>

export const defensibilityvaultizabilityAdminActionSchema = z.enum(['refresh_defensibilityvaultizability_summary'])
export type DefensibilityvaultizabilityAdminAction = z.infer<typeof defensibilityvaultizabilityAdminActionSchema>

export const defensibilityvaultizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(defensibilityvaultizabilityAdminRecordSchema),
  stats: defensibilityvaultizabilityAdminStatsSchema,
  availableActions: z.array(defensibilityvaultizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type DefensibilityvaultizabilityAdminSummaryResponse = z.infer<
  typeof defensibilityvaultizabilityAdminSummaryResponseSchema
>

export const defensibilityvaultizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: defensibilityvaultizabilityAdminActionSchema,
})
export type DefensibilityvaultizabilityAdminActionRequest = z.infer<
  typeof defensibilityvaultizabilityAdminActionRequestSchema
>

export const defensibilityvaultizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: defensibilityvaultizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: defensibilityvaultizabilityAdminStatsSchema.optional(),
})
export type DefensibilityvaultizabilityAdminActionResponse = z.infer<
  typeof defensibilityvaultizabilityAdminActionResponseSchema
>
