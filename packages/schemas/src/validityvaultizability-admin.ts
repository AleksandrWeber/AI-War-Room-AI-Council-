import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const validityvaultizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_invoices',
  'billing_records',
])
export type ValidityvaultizabilityAdminDomain = z.infer<typeof validityvaultizabilityAdminDomainSchema>

export const validityvaultizabilityAdminRecordSchema = z.object({
  domain: validityvaultizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ValidityvaultizabilityAdminRecord = z.infer<typeof validityvaultizabilityAdminRecordSchema>

export const validityvaultizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  validityvaultizabilityPercent: z.number().min(0).max(100),
})
export type ValidityvaultizabilityAdminStats = z.infer<typeof validityvaultizabilityAdminStatsSchema>

export const validityvaultizabilityAdminActionSchema = z.enum(['refresh_validityvaultizability_summary'])
export type ValidityvaultizabilityAdminAction = z.infer<typeof validityvaultizabilityAdminActionSchema>

export const validityvaultizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(validityvaultizabilityAdminRecordSchema),
  stats: validityvaultizabilityAdminStatsSchema,
  availableActions: z.array(validityvaultizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ValidityvaultizabilityAdminSummaryResponse = z.infer<
  typeof validityvaultizabilityAdminSummaryResponseSchema
>

export const validityvaultizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: validityvaultizabilityAdminActionSchema,
})
export type ValidityvaultizabilityAdminActionRequest = z.infer<
  typeof validityvaultizabilityAdminActionRequestSchema
>

export const validityvaultizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: validityvaultizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: validityvaultizabilityAdminStatsSchema.optional(),
})
export type ValidityvaultizabilityAdminActionResponse = z.infer<
  typeof validityvaultizabilityAdminActionResponseSchema
>
