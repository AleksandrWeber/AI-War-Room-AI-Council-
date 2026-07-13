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

export function resolvePreferredActiveWorkspaceId(input: {
  mineWorkspaceIds: readonly string[]
  sessionWorkspaceId?: string | null
  storedActiveWorkspaceId?: string | null
  fallbackWorkspaceId?: string
}): {
  workspaceId: string
  source: 'session' | 'stored' | 'fallback'
} {
  const mine = new Set(input.mineWorkspaceIds)
  const fallbackWorkspaceId = input.fallbackWorkspaceId ?? 'local_workspace'

  if (input.sessionWorkspaceId && mine.has(input.sessionWorkspaceId)) {
    return {
      workspaceId: input.sessionWorkspaceId,
      source: 'session',
    }
  }

  if (
    input.storedActiveWorkspaceId &&
    mine.has(input.storedActiveWorkspaceId)
  ) {
    return {
      workspaceId: input.storedActiveWorkspaceId,
      source: 'stored',
    }
  }

  const fallbackId = mine.has(fallbackWorkspaceId)
    ? fallbackWorkspaceId
    : (input.mineWorkspaceIds[0] ?? fallbackWorkspaceId)

  return {
    workspaceId: fallbackId,
    source: 'fallback',
  }
}
