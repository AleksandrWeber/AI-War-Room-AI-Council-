import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  authCapabilitiesResponseSchema,
  authRolloutResponseSchema,
  authProviderRequiresBearerToken,
  authProviderSupportsSessionBootstrap,
  authProviderWorkspaceHeadersRequired,
  getAuthProviderGuidance,
  type AuthSessionClaims,
  type ExternalAuthIdentity,
} from '@ai-war-room/schemas'
import { buildAuthSessionResponse, verifyAuthSessionToken } from './auth-session.crypto.js'
import { evaluateAuthRollout } from './auth-rollout.helpers.js'
import { getExternalAuthCapabilityGuidance } from './external-auth.adapter.js'
import { ExternalAuthService } from './external-auth.service.js'
import type { ApiEnv } from '../config/env.js'
import type { AuthenticatedRequest } from './workspace-access.guard.js'

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly externalAuthService: ExternalAuthService,
  ) {}

  getCapabilities() {
    const provider = this.configService.get('AUTH_PROVIDER', { infer: true })
    const externalVendor =
      provider === 'external'
        ? this.configService.get('AUTH_EXTERNAL_VENDOR', { infer: true })
        : null
    const externalAdapter =
      provider === 'external'
        ? this.configService.get('AUTH_EXTERNAL_ADAPTER', { infer: true })
        : null

    return authCapabilitiesResponseSchema.parse({
      provider,
      requiresBearerToken: authProviderRequiresBearerToken(provider),
      supportsSessionBootstrap: authProviderSupportsSessionBootstrap(provider),
      supportsExternalProvisioning:
        provider === 'external' &&
        this.configService.get('AUTH_EXTERNAL_AUTO_PROVISION', { infer: true }),
      supportsAuthRollout: true,
      workspaceHeadersRequired: authProviderWorkspaceHeadersRequired(provider),
      externalVendor,
      externalAdapter,
      guidance:
        provider === 'external' && externalVendor && externalAdapter
          ? getExternalAuthCapabilityGuidance(externalVendor, externalAdapter)
          : getAuthProviderGuidance(provider),
    })
  }

  getAuthRollout() {
    const provider = this.configService.get('AUTH_PROVIDER', { infer: true })
    const rollout = evaluateAuthRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      authProvider: provider,
      authBearerToken: this.configService.get('AUTH_BEARER_TOKEN', {
        infer: true,
      }),
      appEncryptionKey: this.configService.get('APP_ENCRYPTION_KEY', {
        infer: true,
      }),
      webOrigin: this.configService.get('WEB_ORIGIN', { infer: true }),
      authExternalAdapter:
        provider === 'external'
          ? this.configService.get('AUTH_EXTERNAL_ADAPTER', { infer: true })
          : undefined,
      authExternalJwtSecret: this.configService.get('AUTH_EXTERNAL_JWT_SECRET', {
        infer: true,
      }),
      authExternalJwksUrl: this.configService.get('AUTH_EXTERNAL_JWKS_URL', {
        infer: true,
      }),
      authExternalIssuer: this.configService.get('AUTH_EXTERNAL_ISSUER', {
        infer: true,
      }),
      authExternalAudience: this.configService.get('AUTH_EXTERNAL_AUDIENCE', {
        infer: true,
      }),
    })

    return authRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
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

  async assertApiAccess(request: AuthenticatedRequest) {
    const provider = this.configService.get('AUTH_PROVIDER', { infer: true })

    if (provider === 'headers') {
      return
    }

    const token = this.extractBearerToken(request)

    if (provider === 'session') {
      request.sessionClaims = this.verifySessionToken(token)
      return
    }

    if (provider === 'external') {
      request.externalAuthIdentity = await this.externalAuthService.verifyToken(
        token,
      )
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

    if (provider === 'external') {
      throw new UnauthorizedException({
        message: 'External auth provider does not support session bootstrap.',
      })
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

    const token = this.extractBearerToken(request)

    if (token !== bearerToken) {
      throw new UnauthorizedException({
        message: 'Invalid Authorization bearer token for session bootstrap.',
      })
    }
  }

  resolveSessionClaims(request: AuthenticatedRequest): AuthSessionClaims | null {
    return request.sessionClaims ?? null
  }

  resolveExternalAuthIdentity(
    request: AuthenticatedRequest,
  ): ExternalAuthIdentity | null {
    return request.externalAuthIdentity ?? null
  }

  resolveAuthIdentity(request: AuthenticatedRequest) {
    const sessionClaims = this.resolveSessionClaims(request)

    if (sessionClaims) {
      return {
        userId: sessionClaims.userId,
        workspaceId: sessionClaims.workspaceId,
      }
    }

    const externalIdentity = this.resolveExternalAuthIdentity(request)

    if (externalIdentity) {
      return {
        userId: externalIdentity.userId,
        workspaceId: externalIdentity.workspaceId,
      }
    }

    return null
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

  private extractBearerToken(request: AuthenticatedRequest) {
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

    return token
  }

  private getSessionSecret() {
    return this.configService.get('APP_ENCRYPTION_KEY', { infer: true })
  }

  private getSingleHeader(value: string | string[] | undefined) {
    return Array.isArray(value) ? value[0] : value
  }
}
