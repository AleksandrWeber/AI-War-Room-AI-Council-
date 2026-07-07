import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const programmabilityvaultizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_invoices',
  'billing_records',
])
export type ProgrammabilityvaultizabilityAdminDomain = z.infer<typeof programmabilityvaultizabilityAdminDomainSchema>

export const programmabilityvaultizabilityAdminRecordSchema = z.object({
  domain: programmabilityvaultizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ProgrammabilityvaultizabilityAdminRecord = z.infer<typeof programmabilityvaultizabilityAdminRecordSchema>

export const programmabilityvaultizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  programmabilityvaultizabilityPercent: z.number().min(0).max(100),
})
export type ProgrammabilityvaultizabilityAdminStats = z.infer<typeof programmabilityvaultizabilityAdminStatsSchema>

export const programmabilityvaultizabilityAdminActionSchema = z.enum(['refresh_programmabilityvaultizability_summary'])
export type ProgrammabilityvaultizabilityAdminAction = z.infer<typeof programmabilityvaultizabilityAdminActionSchema>

export const programmabilityvaultizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(programmabilityvaultizabilityAdminRecordSchema),
  stats: programmabilityvaultizabilityAdminStatsSchema,
  availableActions: z.array(programmabilityvaultizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ProgrammabilityvaultizabilityAdminSummaryResponse = z.infer<
  typeof programmabilityvaultizabilityAdminSummaryResponseSchema
>

export const programmabilityvaultizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: programmabilityvaultizabilityAdminActionSchema,
})
export type ProgrammabilityvaultizabilityAdminActionRequest = z.infer<
  typeof programmabilityvaultizabilityAdminActionRequestSchema
>

export const programmabilityvaultizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: programmabilityvaultizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: programmabilityvaultizabilityAdminStatsSchema.optional(),
})
export type ProgrammabilityvaultizabilityAdminActionResponse = z.infer<
  typeof programmabilityvaultizabilityAdminActionResponseSchema
>
