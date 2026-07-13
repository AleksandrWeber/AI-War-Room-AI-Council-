import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { shieldScanResultSchema } from './shield.js'

export const createShieldOverrideRequestSchema = z.object({
  reason: nonEmptyStringSchema.min(8).max(2_000),
  findingIds: z.array(nonEmptyStringSchema).min(1).max(100),
  shieldScan: shieldScanResultSchema,
})

export const shieldOverrideResponseSchema = z.object({
  overrideId: nonEmptyStringSchema,
  runId: nonEmptyStringSchema,
  workspaceId: nonEmptyStringSchema,
  actorUserId: nonEmptyStringSchema,
  actorRole: z.enum(['owner', 'admin', 'member', 'viewer']),
  reason: nonEmptyStringSchema,
  findingIds: z.array(nonEmptyStringSchema),
  scanId: nonEmptyStringSchema,
  createdAt: nonEmptyStringSchema,
})

export type CreateShieldOverrideRequest = z.infer<
  typeof createShieldOverrideRequestSchema
>
export type ShieldOverrideResponse = z.infer<typeof shieldOverrideResponseSchema>
