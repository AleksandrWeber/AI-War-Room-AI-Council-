import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'

export const authSessionClaimsSchema = z.object({
  userId: nonEmptyStringSchema,
  workspaceId: nonEmptyStringSchema,
  exp: z.number().int().positive(),
})
export type AuthSessionClaims = z.infer<typeof authSessionClaimsSchema>

export const authSessionResponseSchema = z.object({
  token: nonEmptyStringSchema,
  expiresAt: z.number().int().positive(),
  userId: nonEmptyStringSchema,
  workspaceId: nonEmptyStringSchema,
})
export type AuthSessionResponse = z.infer<typeof authSessionResponseSchema>
