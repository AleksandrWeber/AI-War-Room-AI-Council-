import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const dependencyHealthStatusSchema = z.enum(['up', 'down'])
export type DependencyHealthStatus = z.infer<typeof dependencyHealthStatusSchema>

export const dependencyHealthSchema = z.object({
  name: z.enum(['postgres', 'redis', 'temporal']),
  status: dependencyHealthStatusSchema,
  detail: nonEmptyStringSchema.optional(),
})
export type DependencyHealth = z.infer<typeof dependencyHealthSchema>

export const readinessStatusSchema = z.enum(['ready', 'not_ready'])
export type ReadinessStatus = z.infer<typeof readinessStatusSchema>

export const readinessResponseSchema = z.object({
  service: z.literal('ai-war-room-api'),
  status: readinessStatusSchema,
  dependencies: z.array(dependencyHealthSchema),
  checkedAt: utcDateStringSchema,
})
export type ReadinessResponse = z.infer<typeof readinessResponseSchema>
