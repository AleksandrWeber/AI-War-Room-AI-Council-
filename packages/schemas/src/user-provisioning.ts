import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const userProvisioningActionSchema = z.enum([
  'created_user',
  'updated_user',
  'created_workspace',
  'created_membership',
])
export type UserProvisioningAction = z.infer<
  typeof userProvisioningActionSchema
>

export const userProvisioningResponseSchema = z.object({
  userId: nonEmptyStringSchema,
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  actions: z.array(userProvisioningActionSchema),
  provisionedAt: utcDateStringSchema,
})
export type UserProvisioningResponse = z.infer<
  typeof userProvisioningResponseSchema
>
