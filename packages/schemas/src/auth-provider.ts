import { z } from 'zod'

export const authProviderModeSchema = z.enum([
  'headers',
  'bearer',
  'session',
  'external',
])
export type AuthProviderMode = z.infer<typeof authProviderModeSchema>

export const authCapabilitiesResponseSchema = z.object({
  provider: authProviderModeSchema,
  requiresBearerToken: z.boolean(),
  supportsSessionBootstrap: z.boolean(),
  workspaceHeadersRequired: z.boolean(),
  externalVendor: z.enum(['clerk', 'auth0']).nullable(),
  externalAdapter: z.enum(['mock', 'jwks']).nullable(),
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
    case 'external':
      return 'Send Authorization: Bearer <external-provider-token>. Configure AUTH_EXTERNAL_VENDOR to clerk or auth0.'
  }
}

export function authProviderRequiresBearerToken(provider: AuthProviderMode) {
  return provider === 'bearer' || provider === 'session' || provider === 'external'
}

export function authProviderWorkspaceHeadersRequired(
  provider: AuthProviderMode,
) {
  return provider === 'headers' || provider === 'bearer'
}

export function authProviderSupportsSessionBootstrap(
  provider: AuthProviderMode,
) {
  return provider !== 'external'
}
