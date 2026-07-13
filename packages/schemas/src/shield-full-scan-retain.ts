import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { shieldFindingSchema, shieldScanResultSchema } from './shield.js'

export const shieldFullScanRetainRecordSchema = z.object({
  scanId: nonEmptyStringSchema,
  workspaceId: nonEmptyStringSchema,
  runId: nonEmptyStringSchema,
  findings: z.array(shieldFindingSchema).max(100),
  retainUntil: nonEmptyStringSchema,
  redactedAt: nonEmptyStringSchema.nullable(),
  createdAt: nonEmptyStringSchema,
})
export type ShieldFullScanRetainRecord = z.infer<
  typeof shieldFullScanRetainRecordSchema
>

export const shieldFullScanDisputeResponseSchema = z.object({
  scanId: nonEmptyStringSchema,
  workspaceId: nonEmptyStringSchema,
  runId: nonEmptyStringSchema,
  retainUntil: nonEmptyStringSchema,
  expired: z.boolean(),
  findings: z.array(shieldFindingSchema).max(100),
  guidance: nonEmptyStringSchema,
})
export type ShieldFullScanDisputeResponse = z.infer<
  typeof shieldFullScanDisputeResponseSchema
>

export const shieldFullScanPurgeResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  purgedCount: z.number().int().nonnegative(),
  message: nonEmptyStringSchema,
})
export type ShieldFullScanPurgeResponse = z.infer<
  typeof shieldFullScanPurgeResponseSchema
>

/** Re-export for callers that already hold a scan shape. */
export const shieldFullScanSourceSchema = shieldScanResultSchema
