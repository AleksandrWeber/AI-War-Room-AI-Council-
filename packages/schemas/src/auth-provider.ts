import { z } from 'zod'

export const authProviderModeSchema = z.enum(['headers', 'bearer'])
export type AuthProviderMode = z.infer<typeof authProviderModeSchema>

export const authCapabilitiesResponseSchema = z.object({
  provider: authProviderModeSchema,
  requiresBearerToken: z.boolean(),
  workspaceHeadersRequired: z.literal(true),
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
  }
}
