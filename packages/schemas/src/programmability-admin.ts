import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const programmabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'run_workflows',
  'artifacts',
])
export type ProgrammabilityAdminDomain = z.infer<typeof programmabilityAdminDomainSchema>

export const programmabilityAdminRecordSchema = z.object({
  domain: programmabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ProgrammabilityAdminRecord = z.infer<typeof programmabilityAdminRecordSchema>

export const programmabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  programmabilityPercent: z.number().min(0).max(100),
})
export type ProgrammabilityAdminStats = z.infer<typeof programmabilityAdminStatsSchema>

export const programmabilityAdminActionSchema = z.enum(['refresh_programmability_summary'])
export type ProgrammabilityAdminAction = z.infer<typeof programmabilityAdminActionSchema>

export const programmabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(programmabilityAdminRecordSchema),
  stats: programmabilityAdminStatsSchema,
  availableActions: z.array(programmabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ProgrammabilityAdminSummaryResponse = z.infer<
  typeof programmabilityAdminSummaryResponseSchema
>

export const programmabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: programmabilityAdminActionSchema,
})
export type ProgrammabilityAdminActionRequest = z.infer<
  typeof programmabilityAdminActionRequestSchema
>

export const programmabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: programmabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: programmabilityAdminStatsSchema.optional(),
})
export type ProgrammabilityAdminActionResponse = z.infer<
  typeof programmabilityAdminActionResponseSchema
>
