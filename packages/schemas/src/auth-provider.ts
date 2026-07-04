import { z } from 'zod'

export const authProviderModeSchema = z.enum(['headers', 'bearer', 'session'])
export type AuthProviderMode = z.infer<typeof authProviderModeSchema>

export const authCapabilitiesResponseSchema = z.object({
  provider: authProviderModeSchema,
  requiresBearerToken: z.boolean(),
  supportsSessionBootstrap: z.boolean(),
  workspaceHeadersRequired: z.boolean(),
  guidance: z.string(),
})
export type AuthCapabilitiesResponse = z.infer<
  typeof authCapabilitiesResponseSchema
>

export function getAuthProviderGuidance(provider: AuthProviderMode) {
  switch (provider) {
    case 'headers':
      return 'Send x-user-id and x-workspace-id headers for workspace-scoped requests.'
    case 'bearer':
      return 'Send Authorization: Bearer <token> plus x-user-id and x-workspace-id headers for workspace-scoped requests.'
    case 'session':
      return 'Send Authorization: Bearer <signed-session-token>. Bootstrap a session with POST /api/auth/session using workspace headers or the static bearer token.'
  }
}

export function authProviderRequiresBearerToken(provider: AuthProviderMode) {
  return provider === 'bearer' || provider === 'session'
}

export function authProviderWorkspaceHeadersRequired(
  provider: AuthProviderMode,
) {
  return provider === 'headers' || provider === 'bearer'
}
