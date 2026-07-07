import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const identityproofizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_invoices',
  'billing_records',
])
export type IdentityproofizabilityAdminDomain = z.infer<typeof identityproofizabilityAdminDomainSchema>

export const identityproofizabilityAdminRecordSchema = z.object({
  domain: identityproofizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type IdentityproofizabilityAdminRecord = z.infer<typeof identityproofizabilityAdminRecordSchema>

export const identityproofizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  identityproofizabilityPercent: z.number().min(0).max(100),
})
export type IdentityproofizabilityAdminStats = z.infer<typeof identityproofizabilityAdminStatsSchema>

export const identityproofizabilityAdminActionSchema = z.enum(['refresh_identityproofizability_summary'])
export type IdentityproofizabilityAdminAction = z.infer<typeof identityproofizabilityAdminActionSchema>

export const identityproofizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(identityproofizabilityAdminRecordSchema),
  stats: identityproofizabilityAdminStatsSchema,
  availableActions: z.array(identityproofizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type IdentityproofizabilityAdminSummaryResponse = z.infer<
  typeof identityproofizabilityAdminSummaryResponseSchema
>

export const identityproofizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: identityproofizabilityAdminActionSchema,
})
export type IdentityproofizabilityAdminActionRequest = z.infer<
  typeof identityproofizabilityAdminActionRequestSchema
>

export const identityproofizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: identityproofizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: identityproofizabilityAdminStatsSchema.optional(),
})
export type IdentityproofizabilityAdminActionResponse = z.infer<
  typeof identityproofizabilityAdminActionResponseSchema
>
