import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const expressivenessAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'agent_outputs',
  'moderator_syntheses',
])
export type ExpressivenessAdminDomain = z.infer<typeof expressivenessAdminDomainSchema>

export const expressivenessAdminRecordSchema = z.object({
  domain: expressivenessAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ExpressivenessAdminRecord = z.infer<typeof expressivenessAdminRecordSchema>

export const expressivenessAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  expressivenessPercent: z.number().min(0).max(100),
})
export type ExpressivenessAdminStats = z.infer<typeof expressivenessAdminStatsSchema>

export const expressivenessAdminActionSchema = z.enum(['refresh_expressiveness_summary'])
export type ExpressivenessAdminAction = z.infer<typeof expressivenessAdminActionSchema>

export const expressivenessAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(expressivenessAdminRecordSchema),
  stats: expressivenessAdminStatsSchema,
  availableActions: z.array(expressivenessAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ExpressivenessAdminSummaryResponse = z.infer<
  typeof expressivenessAdminSummaryResponseSchema
>

export const expressivenessAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: expressivenessAdminActionSchema,
})
export type ExpressivenessAdminActionRequest = z.infer<
  typeof expressivenessAdminActionRequestSchema
>

export const expressivenessAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: expressivenessAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: expressivenessAdminStatsSchema.optional(),
})
export type ExpressivenessAdminActionResponse = z.infer<
  typeof expressivenessAdminActionResponseSchema
>
