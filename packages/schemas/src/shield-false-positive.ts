import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import {
  shieldFindingCategorySchema,
  shieldScanResultSchema,
  shieldSeveritySchema,
} from './shield.js'
import { workspaceRoleSchema } from './workspace.js'

export const shieldFalsePositiveReportStatusSchema = z.enum([
  'open',
  'accepted',
  'rejected',
])
export type ShieldFalsePositiveReportStatus = z.infer<
  typeof shieldFalsePositiveReportStatusSchema
>

export const createShieldFalsePositiveReportRequestSchema = z.object({
  findingId: nonEmptyStringSchema,
  note: z.string().trim().max(1_000).optional(),
  shieldScan: shieldScanResultSchema,
})
export type CreateShieldFalsePositiveReportRequest = z.infer<
  typeof createShieldFalsePositiveReportRequestSchema
>

export const shieldFalsePositiveReportResponseSchema = z.object({
  reportId: nonEmptyStringSchema,
  runId: nonEmptyStringSchema,
  workspaceId: nonEmptyStringSchema,
  scanId: nonEmptyStringSchema,
  findingId: nonEmptyStringSchema,
  severity: shieldSeveritySchema.exclude(['none']),
  category: shieldFindingCategorySchema,
  actorUserId: nonEmptyStringSchema,
  actorRole: workspaceRoleSchema,
  note: z.string().nullable(),
  status: shieldFalsePositiveReportStatusSchema,
  createdAt: nonEmptyStringSchema,
  updatedAt: nonEmptyStringSchema,
})
export type ShieldFalsePositiveReportResponse = z.infer<
  typeof shieldFalsePositiveReportResponseSchema
>

export const shieldFalsePositiveReportListResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  reports: z.array(shieldFalsePositiveReportResponseSchema),
  openCount: z.number().int().nonnegative(),
})
export type ShieldFalsePositiveReportListResponse = z.infer<
  typeof shieldFalsePositiveReportListResponseSchema
>
