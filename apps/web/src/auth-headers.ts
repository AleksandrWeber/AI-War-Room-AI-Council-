import type { AuthCapabilitiesResponse } from '@ai-war-room/schemas'

const defaultWorkspaceAuthHeaders = {
  'x-user-id': 'user_local',
  'x-workspace-id': 'local_workspace',
} as const

export function buildWorkspaceAuthHeaders(
  authCapabilities?: Pick<AuthCapabilitiesResponse, 'requiresBearerToken'> | null,
) {
  const headers: Record<string, string> = {
    ...defaultWorkspaceAuthHeaders,
  }
  const bearerToken = import.meta.env.VITE_AUTH_BEARER_TOKEN

  if (authCapabilities?.requiresBearerToken && bearerToken) {
    headers.Authorization = `Bearer ${bearerToken}`
  }

  return headers
}
