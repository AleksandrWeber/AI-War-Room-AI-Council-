import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const assurancevaultizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_invoices',
  'billing_records',
])
export type AssurancevaultizabilityAdminDomain = z.infer<typeof assurancevaultizabilityAdminDomainSchema>

export const assurancevaultizabilityAdminRecordSchema = z.object({
  domain: assurancevaultizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type AssurancevaultizabilityAdminRecord = z.infer<typeof assurancevaultizabilityAdminRecordSchema>

export const assurancevaultizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  assurancevaultizabilityPercent: z.number().min(0).max(100),
})
export type AssurancevaultizabilityAdminStats = z.infer<typeof assurancevaultizabilityAdminStatsSchema>

export const assurancevaultizabilityAdminActionSchema = z.enum(['refresh_assurancevaultizability_summary'])
export type AssurancevaultizabilityAdminAction = z.infer<typeof assurancevaultizabilityAdminActionSchema>

export const assurancevaultizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(assurancevaultizabilityAdminRecordSchema),
  stats: assurancevaultizabilityAdminStatsSchema,
  availableActions: z.array(assurancevaultizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type AssurancevaultizabilityAdminSummaryResponse = z.infer<
  typeof assurancevaultizabilityAdminSummaryResponseSchema
>

export const assurancevaultizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: assurancevaultizabilityAdminActionSchema,
})
export type AssurancevaultizabilityAdminActionRequest = z.infer<
  typeof assurancevaultizabilityAdminActionRequestSchema
>

export const assurancevaultizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: assurancevaultizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: assurancevaultizabilityAdminStatsSchema.optional(),
})
export type AssurancevaultizabilityAdminActionResponse = z.infer<
  typeof assurancevaultizabilityAdminActionResponseSchema
>
