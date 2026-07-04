import { describe, expect, it } from 'vitest'
import {
  buildProviderKeyAdminStats,
  getProviderKeyAdminGuidance,
  resolveProviderKeyAdminActions,
} from './provider-key-admin.helpers.js'

describe('provider key admin helpers', () => {
  it('builds provider key stats', () => {
    expect(
      buildProviderKeyAdminStats([
        {
          credentialId: 'provider_credential_1',
          workspaceId: 'workspace_1',
          providerId: 'anthropic',
          label: 'Anthropic',
          maskedKey: 'sk-...1234',
          createdByUserId: 'user_test',
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
          lastTestStatus: 'passed',
        },
      ]),
    ).toMatchObject({
      totalCredentials: 1,
      passedCredentials: 1,
      anthropicCredentials: 1,
    })
  })

  it('offers retest when failed credentials exist', () => {
    expect(
      resolveProviderKeyAdminActions({
        stats: buildProviderKeyAdminStats([
          {
            credentialId: 'provider_credential_1',
            workspaceId: 'workspace_1',
            providerId: 'openai',
            label: 'OpenAI',
            maskedKey: 'sk-...5678',
            createdByUserId: 'user_test',
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-01T00:00:00.000Z',
            lastTestStatus: 'failed',
          },
        ]),
      }),
    ).toEqual(['test_all_credentials', 'retest_failed_credentials'])
  })

  it('guides admins when no keys exist', () => {
    expect(
      getProviderKeyAdminGuidance({
        stats: buildProviderKeyAdminStats([]),
      }),
    ).toContain('once workspace BYOK keys are saved')
  })
})
