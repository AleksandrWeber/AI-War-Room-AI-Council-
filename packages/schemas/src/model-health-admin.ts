import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { modelRegistryEntrySchema } from './model-router.js'
import { workspaceRoleSchema } from './workspace.js'

export const modelHealthAdminRecordSchema = modelRegistryEntrySchema.pick({
  modelId: true,
  providerId: true,
  modelName: true,
  lifecycleStatus: true,
  healthStatus: true,
  consecutiveFailures: true,
  updatedAt: true,
})
export type ModelHealthAdminRecord = z.infer<typeof modelHealthAdminRecordSchema>

export const modelHealthAdminStatsSchema = z.object({
  totalModels: z.number().int().nonnegative(),
  activeModels: z.number().int().nonnegative(),
  degradedModels: z.number().int().nonnegative(),
  candidateModels: z.number().int().nonnegative(),
})
export type ModelHealthAdminStats = z.infer<typeof modelHealthAdminStatsSchema>

export const modelHealthAdminActionSchema = z.enum(['recover_model'])
export type ModelHealthAdminAction = z.infer<typeof modelHealthAdminActionSchema>

export const modelHealthAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  models: z.array(modelHealthAdminRecordSchema),
  stats: modelHealthAdminStatsSchema,
  availableActions: z.array(modelHealthAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ModelHealthAdminSummaryResponse = z.infer<
  typeof modelHealthAdminSummaryResponseSchema
>

export const modelHealthAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: modelHealthAdminActionSchema,
  modelId: nonEmptyStringSchema,
})
export type ModelHealthAdminActionRequest = z.infer<
  typeof modelHealthAdminActionRequestSchema
>

export const modelHealthAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: modelHealthAdminActionSchema,
  message: nonEmptyStringSchema,
  model: modelHealthAdminRecordSchema.optional(),
})
export type ModelHealthAdminActionResponse = z.infer<
  typeof modelHealthAdminActionResponseSchema
>
