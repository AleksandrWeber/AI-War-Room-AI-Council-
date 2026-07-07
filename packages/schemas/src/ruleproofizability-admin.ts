import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const ruleproofizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_invoices',
  'billing_records',
])
export type RuleproofizabilityAdminDomain = z.infer<typeof ruleproofizabilityAdminDomainSchema>

export const ruleproofizabilityAdminRecordSchema = z.object({
  domain: ruleproofizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type RuleproofizabilityAdminRecord = z.infer<typeof ruleproofizabilityAdminRecordSchema>

export const ruleproofizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  ruleproofizabilityPercent: z.number().min(0).max(100),
})
export type RuleproofizabilityAdminStats = z.infer<typeof ruleproofizabilityAdminStatsSchema>

export const ruleproofizabilityAdminActionSchema = z.enum(['refresh_ruleproofizability_summary'])
export type RuleproofizabilityAdminAction = z.infer<typeof ruleproofizabilityAdminActionSchema>

export const ruleproofizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(ruleproofizabilityAdminRecordSchema),
  stats: ruleproofizabilityAdminStatsSchema,
  availableActions: z.array(ruleproofizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type RuleproofizabilityAdminSummaryResponse = z.infer<
  typeof ruleproofizabilityAdminSummaryResponseSchema
>

export const ruleproofizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: ruleproofizabilityAdminActionSchema,
})
export type RuleproofizabilityAdminActionRequest = z.infer<
  typeof ruleproofizabilityAdminActionRequestSchema
>

export const ruleproofizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: ruleproofizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: ruleproofizabilityAdminStatsSchema.optional(),
})
export type RuleproofizabilityAdminActionResponse = z.infer<
  typeof ruleproofizabilityAdminActionResponseSchema
>
