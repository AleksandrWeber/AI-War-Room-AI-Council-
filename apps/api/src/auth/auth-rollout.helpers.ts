import type { ApiEnv } from '../config/env.js'
import type { AuthProviderMode } from '@ai-war-room/schemas'

export type AuthRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type AuthRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  provider: AuthProviderMode
  externalAdapter?: ApiEnv['AUTH_EXTERNAL_ADAPTER']
  checks: AuthRolloutCheck[]
  guidance: string
}

export type AuthRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  authProvider: ApiEnv['AUTH_PROVIDER']
  authBearerToken?: string
  appEncryptionKey: string
  webOrigin: string
  authExternalAdapter?: ApiEnv['AUTH_EXTERNAL_ADAPTER']
  authExternalJwtSecret?: string
  authExternalJwksUrl?: string
  authExternalIssuer: string
  authExternalAudience: string
}

const DEFAULT_DEV_ENCRYPTION_KEY = 'local-development-encryption-key-change-me'

function isProductionUrl(url: string) {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:' && !parsed.hostname.includes('127.0.0.1')
  } catch {
    return false
  }
}

export function evaluateAuthRollout(input: AuthRolloutInput): AuthRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const provider = input.authProvider
  const externalAdapter = input.authExternalAdapter
  const checks: AuthRolloutCheck[] = [
    {
      name: 'production_auth_provider',
      label: 'Production auth provider',
      status:
        !isProduction || provider !== 'headers'
          ? 'pass'
          : 'fail',
      detail:
        !isProduction || provider !== 'headers'
          ? `Auth provider is ${provider}.`
          : 'AUTH_PROVIDER=headers cannot be used in production. Use bearer, session, or external auth.',
    },
    {
      name: 'bearer_bootstrap_token',
      label: 'Bearer bootstrap token',
      status:
        !isProduction ||
        provider === 'headers' ||
        provider === 'external' ||
        Boolean(input.authBearerToken)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction ||
        provider === 'headers' ||
        provider === 'external' ||
        input.authBearerToken
          ? provider === 'bearer' || provider === 'session'
            ? 'Bearer bootstrap token is configured.'
            : 'Bearer bootstrap token is not required for the active auth provider.'
          : 'AUTH_BEARER_TOKEN is required for bearer or session auth in production.',
    },
    {
      name: 'encryption_key',
      label: 'Session encryption key',
      status:
        !isProduction || input.appEncryptionKey !== DEFAULT_DEV_ENCRYPTION_KEY
          ? 'pass'
          : 'fail',
      detail:
        !isProduction || input.appEncryptionKey !== DEFAULT_DEV_ENCRYPTION_KEY
          ? 'APP_ENCRYPTION_KEY is configured for production session signing.'
          : 'Replace the default APP_ENCRYPTION_KEY before production rollout.',
    },
    {
      name: 'web_origin_https',
      label: 'Web origin URL',
      status: !isProduction || isProductionUrl(input.webOrigin) ? 'pass' : 'fail',
      detail:
        !isProduction || isProductionUrl(input.webOrigin)
          ? `Web origin is ${input.webOrigin}.`
          : 'Production auth rollout requires HTTPS WEB_ORIGIN.',
    },
  ]

  if (provider === 'external') {
    checks.push(
      {
        name: 'external_auth_adapter',
        label: 'External auth adapter',
        status:
          !isProduction || externalAdapter !== 'mock'
            ? 'pass'
            : 'fail',
        detail:
          !isProduction || externalAdapter !== 'mock'
            ? `External auth adapter is ${externalAdapter}.`
            : 'AUTH_EXTERNAL_ADAPTER=mock cannot be used in production.',
      },
      {
        name: 'external_jwks_config',
        label: 'External JWKS config',
        status:
          externalAdapter !== 'jwks' ||
          Boolean(
            input.authExternalJwksUrl &&
              input.authExternalIssuer &&
              input.authExternalAudience,
          )
            ? 'pass'
            : 'fail',
        detail:
          externalAdapter !== 'jwks'
            ? 'JWKS config is only required for external JWKS auth.'
            : input.authExternalJwksUrl
              ? `External auth uses issuer ${input.authExternalIssuer} and audience ${input.authExternalAudience}.`
              : 'AUTH_EXTERNAL_JWKS_URL is required when AUTH_EXTERNAL_ADAPTER=jwks.',
      },
      {
        name: 'external_mock_secret',
        label: 'External mock JWT secret',
        status:
          externalAdapter !== 'mock' || Boolean(input.authExternalJwtSecret)
            ? 'pass'
            : 'fail',
        detail:
          externalAdapter !== 'mock'
            ? 'Mock JWT secret is only required for external mock auth.'
            : input.authExternalJwtSecret
              ? 'External mock JWT secret is configured.'
              : 'AUTH_EXTERNAL_JWT_SECRET is required for external mock auth.',
      },
    )
  }

  const requiredChecks = checks.filter((check) => check.status !== 'skip')
  const status = requiredChecks.every((check) => check.status === 'pass')
    ? 'ready'
    : 'not_ready'

  return {
    status,
    provider,
    externalAdapter,
    checks,
    guidance:
      status === 'ready'
        ? 'Auth rollout checks passed. Production auth provider, secrets, and web origin are ready for deployment.'
        : 'Auth rollout is not ready. Resolve failed checks before deploying production auth.',
  }
}
