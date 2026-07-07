import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const compliancevaultizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_notifications',
  'billing_webhook_events',
])
export type CompliancevaultizabilityAdminDomain = z.infer<typeof compliancevaultizabilityAdminDomainSchema>

export const compliancevaultizabilityAdminRecordSchema = z.object({
  domain: compliancevaultizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type CompliancevaultizabilityAdminRecord = z.infer<typeof compliancevaultizabilityAdminRecordSchema>

export const compliancevaultizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  compliancevaultizabilityPercent: z.number().min(0).max(100),
})
export type CompliancevaultizabilityAdminStats = z.infer<typeof compliancevaultizabilityAdminStatsSchema>

export const compliancevaultizabilityAdminActionSchema = z.enum(['refresh_compliancevaultizability_summary'])
export type CompliancevaultizabilityAdminAction = z.infer<typeof compliancevaultizabilityAdminActionSchema>

export const compliancevaultizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(compliancevaultizabilityAdminRecordSchema),
  stats: compliancevaultizabilityAdminStatsSchema,
  availableActions: z.array(compliancevaultizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type CompliancevaultizabilityAdminSummaryResponse = z.infer<
  typeof compliancevaultizabilityAdminSummaryResponseSchema
>

export const compliancevaultizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: compliancevaultizabilityAdminActionSchema,
})
export type CompliancevaultizabilityAdminActionRequest = z.infer<
  typeof compliancevaultizabilityAdminActionRequestSchema
>

export const compliancevaultizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: compliancevaultizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: compliancevaultizabilityAdminStatsSchema.optional(),
})
export type CompliancevaultizabilityAdminActionResponse = z.infer<
  typeof compliancevaultizabilityAdminActionResponseSchema
>
