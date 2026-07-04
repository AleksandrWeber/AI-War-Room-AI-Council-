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
  supportsExternalProvisioning: z.boolean(),
  supportsAuthRollout: z.boolean(),
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

export const authRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type AuthRolloutCheckStatus = z.infer<typeof authRolloutCheckStatusSchema>

export const authRolloutCheckSchema = z.object({
  name: z.string().trim().min(1),
  label: z.string().trim().min(1),
  status: authRolloutCheckStatusSchema,
  detail: z.string().trim().min(1),
})
export type AuthRolloutCheck = z.infer<typeof authRolloutCheckSchema>

export const authRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type AuthRolloutStatus = z.infer<typeof authRolloutStatusSchema>

export const authRolloutResponseSchema = z.object({
  status: authRolloutStatusSchema,
  provider: authProviderModeSchema,
  externalAdapter: z.enum(['mock', 'jwks']).nullable().optional(),
  checks: z.array(authRolloutCheckSchema),
  guidance: z.string().trim().min(1),
  checkedAt: z.string().datetime(),
})
export type AuthRolloutResponse = z.infer<typeof authRolloutResponseSchema>
