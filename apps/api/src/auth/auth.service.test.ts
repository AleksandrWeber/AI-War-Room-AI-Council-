import { UnauthorizedException } from '@nestjs/common'
import { describe, expect, it } from 'vitest'
import { AuthService } from './auth.service.js'

function createAuthService(input: {
  authProvider?: 'headers' | 'bearer' | 'session'
  authBearerToken?: string
  nodeEnv?: 'development' | 'test' | 'production'
  sessionSecret?: string
  sessionTtlSeconds?: number
}) {
  return new AuthService({
    get: (key: string) => {
      if (key === 'AUTH_PROVIDER') {
        return input.authProvider ?? 'headers'
      }

      if (key === 'AUTH_BEARER_TOKEN') {
        return input.authBearerToken
      }

      if (key === 'NODE_ENV') {
        return input.nodeEnv ?? 'test'
      }

      if (key === 'APP_ENCRYPTION_KEY') {
        return input.sessionSecret ?? 'test-session-secret-key'
      }

      if (key === 'AUTH_SESSION_TTL_SECONDS') {
        return input.sessionTtlSeconds ?? 3_600
      }

      return undefined
    },
  } as never)
}

describe('AuthService', () => {
  it('reports header auth capabilities by default', () => {
    const service = createAuthService({})

    expect(service.getCapabilities()).toMatchObject({
      provider: 'headers',
      requiresBearerToken: false,
      supportsSessionBootstrap: true,
      workspaceHeadersRequired: true,
    })
  })

  it('reports session auth capabilities when configured', () => {
    const service = createAuthService({ authProvider: 'session' })

    expect(service.getCapabilities()).toMatchObject({
      provider: 'session',
      requiresBearerToken: true,
      workspaceHeadersRequired: false,
    })
  })

  it('accepts requests in header auth mode without bearer tokens', () => {
    const service = createAuthService({ authProvider: 'headers' })

    expect(() =>
      service.assertApiAccess({
        headers: {},
      }),
    ).not.toThrow()
  })

  it('requires a valid bearer token in bearer auth mode', () => {
    const service = createAuthService({
      authProvider: 'bearer',
      authBearerToken: 'prod-token',
    })

    expect(() =>
      service.assertApiAccess({
        headers: {
          authorization: 'Bearer prod-token',
        },
      }),
    ).not.toThrow()

    expect(() =>
      service.assertApiAccess({
        headers: {
          authorization: 'Bearer wrong-token',
        },
      }),
    ).toThrow(UnauthorizedException)
  })

  it('stores verified session claims in session auth mode', () => {
    const service = createAuthService({
      authProvider: 'session',
      sessionSecret: 'test-session-secret-key',
    })
    const session = service.createSession({
      userId: 'user_test',
      workspaceId: 'workspace_1',
    })
    const request = {
      headers: {
        authorization: `Bearer ${session.token}`,
      },
    }

    service.assertApiAccess(request)

    expect(service.resolveSessionClaims(request)).toMatchObject({
      userId: 'user_test',
      workspaceId: 'workspace_1',
    })
  })

  it('creates signed session responses', () => {
    const service = createAuthService({
      sessionSecret: 'test-session-secret-key',
      sessionTtlSeconds: 1_800,
    })

    expect(
      service.createSession({
        userId: 'user_local',
        workspaceId: 'local_workspace',
      }),
    ).toMatchObject({
      userId: 'user_local',
      workspaceId: 'local_workspace',
      expiresAt: expect.any(Number),
      token: expect.any(String),
    })
  })

  it('requires bootstrap bearer tokens in production bearer mode', () => {
    const service = createAuthService({
      authProvider: 'bearer',
      authBearerToken: 'prod-token',
      nodeEnv: 'production',
    })

    expect(() =>
      service.assertSessionBootstrapAccess({
        headers: {},
      }),
    ).toThrow(UnauthorizedException)

    expect(() =>
      service.assertSessionBootstrapAccess({
        headers: {
          authorization: 'Bearer prod-token',
        },
      }),
    ).not.toThrow()
  })
})
