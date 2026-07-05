import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const segmentizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_usage_limits',
  'usage_events',
])
export type SegmentizabilityAdminDomain = z.infer<typeof segmentizabilityAdminDomainSchema>

export const segmentizabilityAdminRecordSchema = z.object({
  domain: segmentizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type SegmentizabilityAdminRecord = z.infer<typeof segmentizabilityAdminRecordSchema>

export const segmentizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  segmentizabilityPercent: z.number().min(0).max(100),
})
export type SegmentizabilityAdminStats = z.infer<typeof segmentizabilityAdminStatsSchema>

export const segmentizabilityAdminActionSchema = z.enum(['refresh_segmentizability_summary'])
export type SegmentizabilityAdminAction = z.infer<typeof segmentizabilityAdminActionSchema>

export const segmentizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(segmentizabilityAdminRecordSchema),
  stats: segmentizabilityAdminStatsSchema,
  availableActions: z.array(segmentizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type SegmentizabilityAdminSummaryResponse = z.infer<
  typeof segmentizabilityAdminSummaryResponseSchema
>

export const segmentizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: segmentizabilityAdminActionSchema,
})
export type SegmentizabilityAdminActionRequest = z.infer<
  typeof segmentizabilityAdminActionRequestSchema
>

export const segmentizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: segmentizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: segmentizabilityAdminStatsSchema.optional(),
})
export type SegmentizabilityAdminActionResponse = z.infer<
  typeof segmentizabilityAdminActionResponseSchema
>
