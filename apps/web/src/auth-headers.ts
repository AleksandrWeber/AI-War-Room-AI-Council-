import type {
  AuthCapabilitiesResponse,
  AuthSessionResponse,
} from '@ai-war-room/schemas'

const sessionStorageKey = 'ai-war-room.auth-session'

const defaultWorkspaceAuthHeaders = {
  'x-user-id': 'user_local',
  'x-workspace-id': 'local_workspace',
} as const

export function loadStoredAuthSession() {
  const saved = localStorage.getItem(sessionStorageKey)

  if (!saved) {
    return null
  }

  try {
    const session = JSON.parse(saved) as AuthSessionResponse
    const now = Math.floor(Date.now() / 1_000)

    if (session.expiresAt <= now) {
      localStorage.removeItem(sessionStorageKey)
      return null
    }

    return session
  } catch {
    localStorage.removeItem(sessionStorageKey)
    return null
  }
}

export function saveStoredAuthSession(session: AuthSessionResponse | null) {
  if (!session) {
    localStorage.removeItem(sessionStorageKey)
    return
  }

  localStorage.setItem(sessionStorageKey, JSON.stringify(session))
}

export function buildBootstrapAuthHeaders(
  authCapabilities?: Pick<
    AuthCapabilitiesResponse,
    'provider' | 'requiresBearerToken'
  > | null,
) {
  const headers: Record<string, string> = {
    ...defaultWorkspaceAuthHeaders,
  }
  const bearerToken = import.meta.env.VITE_AUTH_BEARER_TOKEN

  if (
    authCapabilities?.provider !== 'headers' &&
    authCapabilities?.requiresBearerToken &&
    authCapabilities.provider !== 'external' &&
    bearerToken
  ) {
    headers.Authorization = `Bearer ${bearerToken}`
  }

  return headers
}

export function buildWorkspaceAuthHeaders(
  authCapabilities?: Pick<
    AuthCapabilitiesResponse,
    'provider' | 'requiresBearerToken' | 'workspaceHeadersRequired'
  > | null,
  session?: Pick<AuthSessionResponse, 'token' | 'expiresAt'> | null,
) {
  const headers: Record<string, string> = {}
  const externalToken = import.meta.env.VITE_AUTH_EXTERNAL_TOKEN

  if (authCapabilities?.provider === 'external' && externalToken) {
    headers.Authorization = `Bearer ${externalToken}`
    return headers
  }

  if (authCapabilities?.provider === 'session' && session?.token) {
    headers.Authorization = `Bearer ${session.token}`
    return headers
  }

  if (authCapabilities?.workspaceHeadersRequired !== false) {
    headers['x-user-id'] = defaultWorkspaceAuthHeaders['x-user-id']
    headers['x-workspace-id'] = defaultWorkspaceAuthHeaders['x-workspace-id']
  }

  const bearerToken = import.meta.env.VITE_AUTH_BEARER_TOKEN

  if (authCapabilities?.requiresBearerToken && bearerToken) {
    headers.Authorization = `Bearer ${bearerToken}`
  }

  return headers
}
