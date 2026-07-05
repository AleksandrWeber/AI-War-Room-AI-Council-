import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const parabolizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'moderator_syntheses',
  'agent_outputs',
])
export type ParabolizabilityAdminDomain = z.infer<typeof parabolizabilityAdminDomainSchema>

export const parabolizabilityAdminRecordSchema = z.object({
  domain: parabolizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ParabolizabilityAdminRecord = z.infer<typeof parabolizabilityAdminRecordSchema>

export const parabolizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  parabolizabilityPercent: z.number().min(0).max(100),
})
export type ParabolizabilityAdminStats = z.infer<typeof parabolizabilityAdminStatsSchema>

export const parabolizabilityAdminActionSchema = z.enum(['refresh_parabolizability_summary'])
export type ParabolizabilityAdminAction = z.infer<typeof parabolizabilityAdminActionSchema>

export const parabolizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(parabolizabilityAdminRecordSchema),
  stats: parabolizabilityAdminStatsSchema,
  availableActions: z.array(parabolizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ParabolizabilityAdminSummaryResponse = z.infer<
  typeof parabolizabilityAdminSummaryResponseSchema
>

export const parabolizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: parabolizabilityAdminActionSchema,
})
export type ParabolizabilityAdminActionRequest = z.infer<
  typeof parabolizabilityAdminActionRequestSchema
>

export const parabolizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: parabolizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: parabolizabilityAdminStatsSchema.optional(),
})
export type ParabolizabilityAdminActionResponse = z.infer<
  typeof parabolizabilityAdminActionResponseSchema
>
