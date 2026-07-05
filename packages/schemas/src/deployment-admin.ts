import { z } from 'zod'
import { dependencyHealthSchema, readinessStatusSchema } from './health.js'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const deploymentAdminStatsSchema = z.object({
  readinessStatus: readinessStatusSchema,
  healthyDependencyCount: z.number().int().nonnegative(),
  totalDependencies: z.number().int().nonnegative(),
  apiVersion: nonEmptyStringSchema,
})
export type DeploymentAdminStats = z.infer<typeof deploymentAdminStatsSchema>

export const deploymentAdminActionSchema = z.enum(['refresh_deployment_summary'])
export type DeploymentAdminAction = z.infer<typeof deploymentAdminActionSchema>

export const deploymentAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  readinessStatus: readinessStatusSchema,
  dependencies: z.array(dependencyHealthSchema),
  stats: deploymentAdminStatsSchema,
  nodeEnv: z.enum(['development', 'test', 'production']),
  webOrigin: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
  availableActions: z.array(deploymentAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type DeploymentAdminSummaryResponse = z.infer<
  typeof deploymentAdminSummaryResponseSchema
>

export const deploymentAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: deploymentAdminActionSchema,
})
export type DeploymentAdminActionRequest = z.infer<
  typeof deploymentAdminActionRequestSchema
>

export const deploymentAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: deploymentAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: deploymentAdminStatsSchema.optional(),
})
export type DeploymentAdminActionResponse = z.infer<
  typeof deploymentAdminActionResponseSchema
>
