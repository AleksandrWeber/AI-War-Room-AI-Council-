import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const referencabilityvaultizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_invoices',
  'billing_records',
])
export type ReferencabilityvaultizabilityAdminDomain = z.infer<typeof referencabilityvaultizabilityAdminDomainSchema>

export const referencabilityvaultizabilityAdminRecordSchema = z.object({
  domain: referencabilityvaultizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ReferencabilityvaultizabilityAdminRecord = z.infer<typeof referencabilityvaultizabilityAdminRecordSchema>

export const referencabilityvaultizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  referencabilityvaultizabilityPercent: z.number().min(0).max(100),
})
export type ReferencabilityvaultizabilityAdminStats = z.infer<typeof referencabilityvaultizabilityAdminStatsSchema>

export const referencabilityvaultizabilityAdminActionSchema = z.enum(['refresh_referencabilityvaultizability_summary'])
export type ReferencabilityvaultizabilityAdminAction = z.infer<typeof referencabilityvaultizabilityAdminActionSchema>

export const referencabilityvaultizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(referencabilityvaultizabilityAdminRecordSchema),
  stats: referencabilityvaultizabilityAdminStatsSchema,
  availableActions: z.array(referencabilityvaultizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ReferencabilityvaultizabilityAdminSummaryResponse = z.infer<
  typeof referencabilityvaultizabilityAdminSummaryResponseSchema
>

export const referencabilityvaultizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: referencabilityvaultizabilityAdminActionSchema,
})
export type ReferencabilityvaultizabilityAdminActionRequest = z.infer<
  typeof referencabilityvaultizabilityAdminActionRequestSchema
>

export const referencabilityvaultizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: referencabilityvaultizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: referencabilityvaultizabilityAdminStatsSchema.optional(),
})
export type ReferencabilityvaultizabilityAdminActionResponse = z.infer<
  typeof referencabilityvaultizabilityAdminActionResponseSchema
>
