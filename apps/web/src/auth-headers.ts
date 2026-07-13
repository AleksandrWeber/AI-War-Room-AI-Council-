import type {
  AuthCapabilitiesResponse,
  AuthSessionResponse,
} from '@ai-war-room/schemas'
import { authSessionResponseSchema } from '@ai-war-room/schemas'

const sessionStorageKey = 'ai-war-room.auth-session'
export const activeWorkspaceStorageKey = 'ai-war-room.active-workspace-id'

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

export function loadStoredActiveWorkspaceId(fallback = 'local_workspace') {
  try {
    const saved = localStorage.getItem(activeWorkspaceStorageKey)?.trim()
    return saved && saved.length > 0 ? saved : fallback
  } catch {
    return fallback
  }
}

export function saveStoredActiveWorkspaceId(workspaceId: string) {
  try {
    localStorage.setItem(activeWorkspaceStorageKey, workspaceId)
  } catch {
    // ignore quota / private mode
  }
}

export function buildBootstrapAuthHeaders(
  authCapabilities?: Pick<
    AuthCapabilitiesResponse,
    'provider' | 'requiresBearerToken'
  > | null,
  options?: {
    workspaceId?: string
    userId?: string
  },
) {
  const headers: Record<string, string> = {
    'x-user-id':
      options?.userId ?? defaultWorkspaceAuthHeaders['x-user-id'],
    'x-workspace-id':
      options?.workspaceId ?? defaultWorkspaceAuthHeaders['x-workspace-id'],
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

export async function createOrReissueAuthSession(input: {
  apiBaseUrl: string
  authCapabilities?: Pick<
    AuthCapabilitiesResponse,
    'provider' | 'requiresBearerToken' | 'supportsSessionBootstrap'
  > | null
  workspaceId: string
  userId?: string
  existingSession?: Pick<
    AuthSessionResponse,
    'token' | 'userId' | 'expiresAt'
  > | null
}) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (input.existingSession?.token) {
    headers.Authorization = `Bearer ${input.existingSession.token}`
    headers['x-user-id'] = input.existingSession.userId
    headers['x-workspace-id'] = input.workspaceId
  } else {
    Object.assign(
      headers,
      buildBootstrapAuthHeaders(input.authCapabilities, {
        workspaceId: input.workspaceId,
        userId: input.userId,
      }),
    )
  }

  const response = await fetch(`${input.apiBaseUrl}/auth/session`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ workspaceId: input.workspaceId }),
  })

  if (!response.ok) {
    let detail = `API returned ${response.status}`
    try {
      const payload = (await response.json()) as {
        message?: string | { message?: string }
      }
      if (typeof payload.message === 'string' && payload.message.trim()) {
        detail = payload.message
      } else if (
        payload.message &&
        typeof payload.message === 'object' &&
        typeof payload.message.message === 'string'
      ) {
        detail = payload.message.message
      }
    } catch {
      // keep status fallback
    }
    throw new Error(detail)
  }

  return authSessionResponseSchema.parse(await response.json())
}

export function buildWorkspaceAuthHeaders(
  authCapabilities?: Pick<
    AuthCapabilitiesResponse,
    'provider' | 'requiresBearerToken' | 'workspaceHeadersRequired'
  > | null,
  session?: Pick<AuthSessionResponse, 'token' | 'expiresAt'> | null,
  options?: {
    workspaceId?: string
    userId?: string
  },
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
    headers['x-user-id'] =
      options?.userId ?? defaultWorkspaceAuthHeaders['x-user-id']
    headers['x-workspace-id'] =
      options?.workspaceId ?? defaultWorkspaceAuthHeaders['x-workspace-id']
  }

  const bearerToken = import.meta.env.VITE_AUTH_BEARER_TOKEN

  if (authCapabilities?.requiresBearerToken && bearerToken) {
    headers.Authorization = `Bearer ${bearerToken}`
  }

  return headers
}
