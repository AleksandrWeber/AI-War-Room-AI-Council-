import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  authCapabilitiesResponseSchema,
  authProviderRequiresBearerToken,
  authProviderWorkspaceHeadersRequired,
  getAuthProviderGuidance,
  type AuthSessionClaims,
} from '@ai-war-room/schemas'
import { buildAuthSessionResponse, verifyAuthSessionToken } from './auth-session.crypto.js'
import type { ApiEnv } from '../config/env.js'
import type { AuthenticatedRequest } from './workspace-access.guard.js'

@Injectable()
export class AuthService {
  constructor(private readonly configService: ConfigService<ApiEnv, true>) {}

  getCapabilities() {
    const provider = this.configService.get('AUTH_PROVIDER', { infer: true })

    return authCapabilitiesResponseSchema.parse({
      provider,
      requiresBearerToken: authProviderRequiresBearerToken(provider),
      supportsSessionBootstrap: true,
      workspaceHeadersRequired: authProviderWorkspaceHeadersRequired(provider),
      guidance: getAuthProviderGuidance(provider),
    })
  }

  createSession(input: { userId: string; workspaceId: string }) {
    const ttlSeconds = this.configService.get('AUTH_SESSION_TTL_SECONDS', {
      infer: true,
    })

    return buildAuthSessionResponse({
      userId: input.userId,
      workspaceId: input.workspaceId,
      secret: this.getSessionSecret(),
      ttlSeconds,
    })
  }

  assertApiAccess(request: AuthenticatedRequest) {
    const provider = this.configService.get('AUTH_PROVIDER', { infer: true })

    if (provider === 'headers') {
      return
    }

    const authorization = this.getSingleHeader(request.headers.authorization)

    if (!authorization?.startsWith('Bearer ')) {
      throw new UnauthorizedException({
        message: 'Missing Authorization bearer token.',
      })
    }

    const token = authorization.slice('Bearer '.length).trim()

    if (!token) {
      throw new UnauthorizedException({
        message: 'Missing Authorization bearer token.',
      })
    }

    if (provider === 'session') {
      request.sessionClaims = this.verifySessionToken(token)
      return
    }

    const bearerToken = this.configService.get('AUTH_BEARER_TOKEN', {
      infer: true,
    })

    if (!bearerToken || token !== bearerToken) {
      throw new UnauthorizedException({
        message: 'Invalid Authorization bearer token.',
      })
    }
  }

  assertSessionBootstrapAccess(request: AuthenticatedRequest) {
    const provider = this.configService.get('AUTH_PROVIDER', { infer: true })

    if (provider === 'headers') {
      return
    }

    const bearerToken = this.configService.get('AUTH_BEARER_TOKEN', {
      infer: true,
    })

    if (!bearerToken) {
      if (this.configService.get('NODE_ENV', { infer: true }) === 'production') {
        throw new UnauthorizedException({
          message:
            'AUTH_BEARER_TOKEN is required to bootstrap sessions in production.',
        })
      }

      return
    }

    const authorization = this.getSingleHeader(request.headers.authorization)

    if (!authorization?.startsWith('Bearer ')) {
      throw new UnauthorizedException({
        message: 'Missing Authorization bearer token for session bootstrap.',
      })
    }

    const token = authorization.slice('Bearer '.length).trim()

    if (token !== bearerToken) {
      throw new UnauthorizedException({
        message: 'Invalid Authorization bearer token for session bootstrap.',
      })
    }
  }

  resolveSessionClaims(request: AuthenticatedRequest): AuthSessionClaims | null {
    return request.sessionClaims ?? null
  }

  private verifySessionToken(token: string) {
    try {
      return verifyAuthSessionToken({
        token,
        secret: this.getSessionSecret(),
      })
    } catch (error) {
      throw new UnauthorizedException({
        message:
          error instanceof Error
            ? error.message
            : 'Invalid auth session token.',
      })
    }
  }

  private getSessionSecret() {
    return this.configService.get('APP_ENCRYPTION_KEY', { infer: true })
  }

  private getSingleHeader(value: string | string[] | undefined) {
    return Array.isArray(value) ? value[0] : value
  }
}
