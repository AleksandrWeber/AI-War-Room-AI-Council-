import { ConfigService } from '@nestjs/config'
import { describe, expect, it } from 'vitest'
import type { ApiEnv } from '../config/env.js'
import { InMemoryProviderCredentialRepository } from './in-memory-provider-credential.repository.js'
import { ProviderCredentialEncryptionService } from './provider-credential-encryption.service.js'
import { ProviderCredentialTesterService } from './provider-credential-tester.service.js'
import { ProviderCredentialsAdminService } from './provider-credentials-admin.service.js'
import { ProviderCredentialsService } from './provider-credentials.service.js'

function createProviderCredentialsAdminService(env: Partial<ApiEnv> = {}) {
  const configService = new ConfigService<ApiEnv>({
    NODE_ENV: 'test',
    LLM_PRIMARY_PROVIDER: 'mock',
    LLM_FALLBACK_PROVIDER: 'mock',
    APP_ENCRYPTION_KEY: 'local-development-encryption-key-change-me',
    ...env,
  })
  const repository = new InMemoryProviderCredentialRepository()
  const encryptionService = new ProviderCredentialEncryptionService(configService)
  const providerCredentialsService = new ProviderCredentialsService(
    repository,
    encryptionService,
    new ProviderCredentialTesterService(),
    configService,
  )

  return {
    service: new ProviderCredentialsAdminService(
      configService,
      providerCredentialsService,
      encryptionService,
    ),
    providerCredentialsService,
  }
}

describe('ProviderCredentialsAdminService', () => {
  it('reports provider credentials capabilities', () => {
    const { service } = createProviderCredentialsAdminService()

    expect(service.getCapabilities()).toMatchObject({
      supportsProviderCredentialsRollout: true,
      supportsProviderKeyAdminTools: true,
      managedProviders: [
        'anthropic',
        'openai',
        'gemini',
        'cursor',
        'openrouter',
      ],
    })
  })

  it('reports provider credentials rollout readiness', () => {
    const { service } = createProviderCredentialsAdminService()

    expect(service.getProviderCredentialsRollout()).toMatchObject({
      status: 'ready',
    })
  })

  it('returns workspace provider key admin summary for owners', async () => {
    const { service } = createProviderCredentialsAdminService()

    await expect(
      service.getWorkspaceProviderKeyAdminSummary(
        {
          userId: 'user_test',
          workspaceId: 'workspace_1',
          role: 'owner',
        },
        'workspace_1',
      ),
    ).resolves.toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalCredentials: 0,
      },
    })
  })

  it('rejects provider key admin tools for members', async () => {
    const { service } = createProviderCredentialsAdminService()

    await expect(
      service.getWorkspaceProviderKeyAdminSummary(
        {
          userId: 'user_member',
          workspaceId: 'workspace_1',
          role: 'member',
        },
        'workspace_1',
      ),
    ).rejects.toMatchObject({
      response: {
        message: 'Only workspace owners and admins can manage provider keys.',
      },
    })
  })
})
